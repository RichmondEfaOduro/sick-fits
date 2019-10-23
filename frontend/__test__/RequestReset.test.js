import {mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import RequestReset, { REQUEST_RESET_MUTATION } from '../components/RequestReset';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeItem } from '../lib/testUtils';
import { CREATE_ITEM_MUTATION } from '../components/CreateItem';

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: 'rich@test.com' },
    },
    result: {
      data: { requestReset: { message: 'success', __typename: 'Message' } }
    },
  }
];

describe('<RequestReset /> ', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    const form = wrapper.find('[data-test="requestReset"]');
    expect(toJSON(form)).toMatchSnapshot();
  });
  it('calls the mutation', async ()  => {
    const wrapper = mount(
       <MockedProvider mocks={mocks}>
         <RequestReset />
       </MockedProvider>
    );
    //   //simulate typing an email
      wrapper
      .find('input')
      .simulate('change', { target: { name: 'email', value: 'rich@test.com'} });
  //   //submit form
      wrapper.find('form').simulate('submit');
      await wait();
      wrapper.update();
      expect(wrapper.find('p').text()).toContain('Success! check your email for a reset link!');
   });
   
});