const { forwardTo } = require ('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
    items: forwardTo('db'),
    item: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    me(parent, args, ctx, info) {
        //check if there is a current userId
        if(!ctx.request.userId) {
            return null;
        }
        return ctx.db.query.user(
            {where: {id: ctx.request.userId},
            }, 
            info
        );
    },

    async users (parent, args, ctx, info) {
        //check if user is logged in
        if(!ctx.request.user) {
            throw new Error('You must be logged in!');
        }
        hasPermission(ctx.request.user,['ADMIN', 'PERMISSIONUPDATE'] );
        //check if user has permissions to query all users
        //if user does, query all user
        return await ctx.db.query.users({}, info);
    },

    async order(parent, args, ctx, info ) {
        //make sure they are logged in
        if(!ctx.request.userId) {
            throw new Error('You need to sign in');
        }
        //query current order
        const order = await ctx.db.query.order ({
            where: { id: args.id }
        }, info);
        //check if they have the permissions to see order
        const ownsOrder = order.user.id === ctx.request.userId;
        const hasPermissionsToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
        if(!ownsOrder && !hasPermissionsToSeeOrder) {
            throw new Error('You cant see this order!');
        }
        //return order
        return order;
    },

    async orders (parent, args, ctx, info) {
        const { userId } = ctx.request;

        if(!userId) {
            throw new Error('You need to sign in');
        }

        return await ctx.db.query.orders({
            where: {
                user: { id: userId } 
            }
        }, info);
    },
};

module.exports = Query;
