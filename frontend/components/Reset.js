import React, { Component } from 'react';
import {Mutation} from 'react-apollo'
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import {CURRENT_USER_QUERY} from './User';
import PropTypes from 'prop-types';


const RESET_MUTATION = gql`
    mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmationPassword: String!) {
        resetPassword(resetToken: $resetToken, password: $password, confirmationPassword: $confirmationPassword) {
            id
            email
            name
        }
    }
`;

class Reset extends Component {
    static propTypes = {
        resetToken: PropTypes.string.isRequired,
    }

    state = {
        password:'',
        confirmationPassword: ''
    }

    saveToState = (e) => {
        e.preventDefault();
        this.setState({[e.target.name]: e.target.value});
    }
    render() {
        return (
            <Mutation 
            mutation={RESET_MUTATION} 
            variables={{
                resetToken: this.props.resetToken,
                password: this.state.password,
                confirmationPassword: this.state.confirmationPassword
            }}
            refetchQueries={[{query: CURRENT_USER_QUERY}]}
            >
                {(reset, {error, loading, called}) => {
          return (
            <Form method="post" onSubmit={( async e => {
                e.preventDefault();
                await reset();
                this.setState({password: '', confirmationPassword: ''});
                
            })}>
                <fieldset disabled={loading} aria-busy={loading}>
                    <h2>Reset your password</h2>
                    <Error error={error} />
                    <label htmlFor="password">
                        password
                        <input 
                        type="password" 
                        name="password" 
                        placeholder="password" 
                        value={this.state.password} 
                        onChange={this.saveToState} />
                    </label>
                    <label htmlFor="confirmationPassword">
                        Confirm your passowrd
                        <input 
                        type="password" 
                        name="confirmationPassword" 
                        placeholder="confirmationPassword" 
                        value={this.state.confirmationPassword} 
                        onChange={this.saveToState} />
                    </label>
    
                    <button type="submit">reset your password!</button>
                </fieldset>
            </Form>
          )
            }}
            </Mutation>
        );
    }
}

export default Reset;