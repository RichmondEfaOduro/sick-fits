import React, { Component } from 'react';
import {Mutation} from 'react-apollo'
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import {CURRENT_USER_QUERY} from './User';

const SIGNUP_MUATION = gql`
    mutation SIGNUP_MUATION($email: String!, $name: String!, $password: String!) {
        signUp(email: $email, name: $name, password: $password) {
            id
            email
            name
        }
    }
`;

class Signup extends Component {
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
            mutation={SIGNUP_MUATION} 
            variables={this.state}
            refetchQueries={[{query: CURRENT_USER_QUERY}]}
            >
                {(signup, {error, loading}) => {
          return (
            <Form method="post" onSubmit={( async e => {
                e.preventDefault();
                try {
                    await signup();
                }catch(error) {
                    alert('Error while trying to create account, please try again');
                    console.log(error);
                }
                this.setState({name: '', email: '', password: ''});
            })}>
                <fieldset disabled={loading} aria-busy={loading}>
                    <h2>Sign up for an Account</h2>
                    <Error error={error} />
                    <label htmlFor="email">
                        Email
                        <input type="text" name="email" placeholder="email" value={this.state.email} onChange={this.saveToState} />
                    </label>
                    <label htmlFor="name">
                        Name
                        <input type="text" name="name" placeholder="name" value={this.state.name} onChange={this.saveToState} />
                    </label>
                    <label htmlFor="password">
                    Password
                        <input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.saveToState} />
                    </label>
                    <button type="submit">Sign up!</button>
                </fieldset>
            </Form>
          )
            }}
            </Mutation>
        );
    }
}

export default Signup;
export { SIGNUP_MUATION };