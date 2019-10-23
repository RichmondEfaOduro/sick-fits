import PleaseSignIn from '../components/PleaseSignIn';
import Order from '../components/Order';
const orderPage = props => (
    <div>
        <PleaseSignIn>
            <Order id={props.query.id}>this is a single order </Order> 
        </PleaseSignIn>
    </div>
)

export default orderPage;