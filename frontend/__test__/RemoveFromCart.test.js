import {mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import RemoveFromCart, { REMOVE_FROM_CART_MUTATION } from '../components/RemoveFromCart';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser, fakeCartItem } from '../lib/testUtils';
import { CURRENT_USER_QUERY } from '../components/User';
import { ApolloConsumer } from 'react-apollo';

global.alert = console.log;

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [
            fakeCartItem(
              {
                id: 'abc123',
                __typename: 'CartItem'
              }
            )
          ],
        }
      }
    }
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: {id: 'abc123'} },
    result: { 
      data: {
        id: 'abc123',
        removeFromCart: {
          id: 'abc123', 
          __typename: 'CartItem'
        },
      } 
    }
  }
];

describe('<RemoveFromCart />', () => {
  it('Renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RemoveFromCart id="abc123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find('button'))).toMatchSnapshot();
    });

    it('removes the item from cart', async () => {
      let apolloClient;
      const wrapper = mount(
        <MockedProvider mocks={mocks}>
          <ApolloConsumer>
            {client => {
              apolloClient = client;
              return <RemoveFromCart id="abc123" />;
            }}
          </ApolloConsumer>
        </MockedProvider>
      );
      const res = await apolloClient.query({ query: CURRENT_USER_QUERY });
      expect(res.data.me.cart).toHaveLength(1);
      expect(res.data.me.cart[0].item.price).toBe(5000);
      wrapper.find('button').simulate('click');
      await wait();
      
      const res2 = await apolloClient.query({ query: CURRENT_USER_QUERY });
      expect(res2.data.me.cart).toHaveLength(0);

    })
})