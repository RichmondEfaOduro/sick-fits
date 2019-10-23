import PaginationStyles from './styles/PaginationStyles';
import gql  from 'graphql-tag';
import Head from 'next/head';
import Link from 'next/link';
import {Query} from 'react-apollo';
import {perPage} from '../config';


const PAGINATION_QUERY = gql`
    query PAGINATION_QUERY {
        itemsConnection {
            aggregate {
                count
            }
        }
    }
`;

const Pagination = props => (
    
        <Query query={PAGINATION_QUERY}>
        {({data, loading, error}) =>  {
            if(loading) return <p>Loading ...</p>
            const count = data.itemsConnection.aggregate.count;
            const pages = Math.ceil(count / perPage);
            const page = props.page;
            return (<PaginationStyles data-test="pagination">
                <Head>
                    <title>
                        Sick fits page {page} of {pages}
                    </title>
                </Head>
                <Link prefetch href={{pathname: 'items', query: {page: page - 1}}}>
                    <a href="" className="prev" aria-disabled={page <= 1}>Prev</a>
                </Link>
                <p>
                    {props.page} of 
                    <span className="totalPages">{pages}</span>
                </p>
                <p>{count} items total</p>
                <Link prefetch href={{pathname: 'items', query: {page: page + 1}}}>
                    <a href="" className="next" aria-disabled={page >= pages}>Next</a>
                </Link>
            </PaginationStyles>
            )
        }}
        </Query>
);

export default Pagination;
export { PAGINATION_QUERY };