
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
      orders {
        id
      }
      cart {
        id
        quantity
        item{
          id
          price
          image
          title
          description
        }
      }
    }
  }
`;


const User = props => {
   return (
   <Query {...props} query={CURRENT_USER_QUERY}>
        {payload => props.children(payload)}
    </Query>
   );
}

User.propTypes = {
    children: PropTypes.func.isRequired,
};
  
export { CURRENT_USER_QUERY };
export default User;