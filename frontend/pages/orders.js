import PleaseSignIn from '../components/PleaseSignIn';
import OrderList from '../components/OrderList';
const orders = props => (
    <div>
        <PleaseSignIn>
            <OrderList />
        </PleaseSignIn>
    </div>
)

export default orders;