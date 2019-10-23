import Items from '../components/Items';
import SingleItem from '../components/SingelItem';
const item = props => (
    <div>
        <SingleItem id={props.query.id}/>
    </div>
)

export default item;