import React, { Component } from 'react';
import {Mutation} from 'react-apollo'
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import {CURRENT_USER_QUERY} from './User';
import Router from 'next/router';


const SIGNIN_MUATION = gql`
    mutation SIGNIN_MUATION($email: String!, $password: String!) {
        signIn(email: $email, password: $password) {
            id
            email
            name
        }
    }
`;

class Signin extends Component {
    state = {
        name: '',
        email: '',
        password: ''
    }

    saveToState = (e) => {
        e.preventDefault();
        this.setState({[e.target.name]: e.target.value});
    }
    render() {
        return (
            <Mutation 
            mutation={SIGNIN_MUATION} 
            variables={this.state}
            refetchQueries={[{query: CURRENT_USER_QUERY}]}
            >
                {(signIn, {error, loading}) => {
          return (
            <Form method="post" onSubmit={( async e => {
                e.preventDefault();
                try {
                    await signIn();
                    Router.push({
                        pathname: '/items'
                    });
                }catch(error) {
                    alert('Error while trying to create account, please try again');
                    console.log(error);
                }
                this.setState({name: '', email: '', password: ''});
            })}>
                <fieldset disabled={loading} aria-busy={loading}>
                    <h2>Sign in</h2>
                    <Error error={error} />
                    <label htmlFor="email">
                        Email
                        <input type="text" name="email" placeholder="email" value={this.state.email} onChange={this.saveToState} />
                    </label>
                    <label htmlFor="password">
                    Password
                        <input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.saveToState} />
                    </label>
                    <button type="submit">Sign in!</button>
                </fieldset>
            </Form>
          )
            }}
            </Mutation>
        );
    }
}

export default Signin;