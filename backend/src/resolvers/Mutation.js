const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const {transport, makeANiceEmail} = require('../mail');
const { hasPermission } = require ('../utils');
const stripe = require('../stripe');

const Mutations = {
    async createItem(parent, args, ctx, info){
        //check if user is logfed in
        if(!ctx.request.userId) {
            throw new Error('You need to log in, in order to create an item!');
        }
        const item = await ctx.db.mutation.createItem({
            data:{
                //cretes a relationship between item and user
                user: {
                    connect: {
                        id: ctx.request.userId,
                    }
                },
                ...args
            }
        }, info);
        return item;
    },
    updateItem(parent, args, ctx, info) {
        const updates = { ...args };
        delete updates.id;
        return ctx.db.mutation.updateItem({
            data: updates,
            where:{
                id: args.id
            },
        }, 
            info
        );
    },
    
    async deleteItem (parent, args, ctx, info) {
        //find the item
        const where = { id: args.id};
        //check if they own the item
        const item = await ctx.db.query.item({ where }, `{id, title, user { id }}`);

        const ownsItem = item.user.id === ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));
        if(!ownsItem && hasPermissions) {
            throw new Error('You dont have permissions to do that!');
        }
        //delete the users
        return ctx.db.mutation.deleteItem({where}, info);
    },

    async signUp (parent, args, ctx, info) {
        args.email = args.email.toLowerCase();
        //hashes the password
        const password = await bcrypt.hash(args.password, 10);
        //create user
        const user = await ctx.db.mutation.createUser(
            {
                data: { 
                ...args, 
                    password, 
                    permissions: { set: ['USER', 'ADMIN'] },
                },
            }, 
            info
        );
        const token = jwt .sign({userId: user.id}, process.env.APP_SECRET);
        //sets a jwt on the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        //returns user to browser
        return user;

    }, 
    async signIn(parent, {email, password}, ctx, info) {
        //check if there is a user
        const user = await ctx.db.query.user({where: {email}});
        if(!user) {
            throw new Error('Incorrect email');
        }
        //check if the password is correct
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) {
            throw new Error('Incorrect password');
        }
        //generate JWT
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        //set cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        //return user
        return user;
    },

     signOut(parent, {email, password}, ctx, info) {
        ctx.response.clearCookie('token');
        return {message: 'You are logged out now!'}
    },

    async requestReset(parent, args, ctx, info) {
        //check if this is real user
        const user = await ctx.db.query.user({where: {email: args.email}});
        if(!user) {
            throw new Error(`Incorrect email, no such user found for email ${args.email}`);
        }
        //sets a reset token
        const randomBytesPromiseified = promisify(randomBytes);
        const resetToken = (await randomBytesPromiseified(20)).toString('hex');
        const restTokeExipry = Date.now() + 3600000;
        const res = await ctx.db.mutation.updateUser({
            where: {email: args.email},
            data: {resetToken, restTokeExipry}
        });
        
        //email the reset token
        try {
            const mailRes = await transport.sendMail({
                from: 'rich@richmond.com',
                to: user.email,
                subject: 'Your password reset email',
                html: makeANiceEmail (`Your password reset token is here \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">click here to reset</a>`)
            });
        }catch(error) {
            console.log(error)
        }

        return { message: 'Thanks!' };
    },
    
    async resetPassword (parent, args, ctx, info) {
        //check if the password mathces
        if(args.password !== args.confirmationPassword) {
            throw new Error('Your password does match!!!!!')
        }

        //check if it is a legit reset token
        //check if token is expired
        const [user] = await ctx.db.query.users({
            where: {
                resetToken: args.resetToken,
                restTokeExipry_gte: Date.now() - 3600000,
            },
        });
        if(!user) {
            throw new Error('This token is either invalid or expired');
        }


        //hases password
        const password = await bcrypt.hash(args.password, 10);

        //saves new passord to user and removes reset field
        const updateUser = await ctx.db.mutation.updateUser({
            where: {email: user.email},
            data: {
                password,
                resetToken: null,
                restTokeExipry: null,    
            },
        });
        //generate JWT
        const token = jwt.sign({userId: updateUser.id}, process.env.APP_SECRET);
        //Set the JWT
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        //return new user
        return updateUser;

    },

   async updatePermissions (parent, args, ctx, info) {
        //check if they are logged in
        if(!ctx.request.userId) {
            throw new Error ('You must be logged in');
        }
        //query the current user
        const currentUser = await ctx.db.query.user({
            where: {
                id: ctx.request.userId,
            }, 
        }, info);
        //check if they have correct permission
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        //update updatePermission
        return ctx.db.mutation.updateUser({
            data: {
                permissions: {set: args.permissions}
            },
            where: {
                id: args.userId
            },
        }, info);
    },

    async addToCart (parent, args, ctx, info) {
        //check if user is signed in
        const {userId} = ctx.request;
        if(!userId) {
            throw new Error('please sign in before adding to cart');
        }
        //Query the users current cart
        const [existingCartItem] = await ctx.db.query.cartItems({
                where: {
                    user: { id: userId },
                    item: { id: args.id },
                },
            },
        );
        //check if item is already in cart and increment by 1
        if (existingCartItem) {
            console.log('this item is already in the cart');
            return ctx.db.mutation.updateCartItem(
                {
                    where: { id: existingCartItem.id},
                    data: { quantity: existingCartItem.quantity + 1},
                }
                , info);
            console.log(existingCartItem);
        }
        //if its not, create a fresh cart item
        return ctx.db.mutation.createCartItem(
            {
                data: {
                    user: {
                        connect: { id: userId },
                    },
                    item: {
                        connect: {id: args.id},
                    },
                },
            }, 
            info);
    },

    async removeFromCart(parent, args, ctx, info) {
        //check if the user is logged in
        const {userId} = ctx.request;
        if(!userId) {
            throw new Error('please sign in before trying to remove something from the cart!');
        }
        //find cart item
        const cartItem= await ctx.db.query.cartItem({
            where: {
                id: args.id,
            },
        }, `{id, user {id}}`);

        //make sure there is an item
        if(!cartItem) {
            throw new Error('No cart item found!');
        }
        //make sure they own the item (is in their cart)
        if(cartItem.user.id !== ctx.request.userId) {
            throw new Error('This item doesnot blong to you');
        }
        //delete their cart item
        return ctx.db.mutation.deleteCartItem({
            where: {id: args.id},
        }, info)
    },

    async createOrder(parent, args, ctx, info) {
        //query current user and make sure they are signed in
        const { userId } = ctx.request;
        if(!userId) throw new Error('You need to sign in in order to complete the order!');
        const user = await ctx.db.query.user({ 
            where: { id: userId } },
            `{
                id
                name
                email
                cart {
                    id
                    quantity
                    item { title price id description image largeImage }
                }
            }`
        ); 
        //recalculate total of price
        const amount = user.cart.reduce((tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0);
        console.log(`Charge for a total of ${amount}`);
        //create stripe charge (turn token into money)
        const charge = await stripe.charges.create({
            amount,
            currency: 'USD',
            source: args.token
        })
        //convert cartItem to orderItems
        const orderItems = user.cart.map(cartItem => {
            const orderItem = {
                ...cartItem.item,
                quantity: cartItem.quantity,
                user: { connect: { id: userId } },
            }
            delete orderItem.id;
            return orderItem;
        });
        //create the order
        const order = await ctx.db.mutation.createOrder({
            data: {
                total: charge.amount,
                charge: charge.id,
                items: { create: orderItems },
                user: { connect: { id: userId } },
            }
        })
        //clear user cart, delete cartItems
        const cartItemIds = user.cart.map(cartItem => cartItem.id);
        await ctx.db.mutation.deleteManyCartItems({ 
            where: {
            id_in: cartItemIds
            },
        });
        // return the order to the client
        return order;
    },
}; 

module.exports = Mutations;
