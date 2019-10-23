import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {TransitionGroup, CSSTransition} from 'react-transition-group';

const Dot = styled.div`
    background: ${props => props.theme.red};
    color: white;
    border-radius: 50%;
    padding: 0.5rem;
    line-height: 2rem;
    min-width: 3rem;
    margin-left: 1rem;
    font-weight: 100;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
`;

const AnimationStyles = styled.span`
    position: relative;
    .count{
        display: block;
        position: relative;
        transition: all 0.25s;
        backface-visibility: hidden;
    }
    /* initial state of the entered dot*/
    .count-enter {
        transform: rotateX(0.5turn);
    }
    .counter-enter-active {
        transform: rotateX(0);
    }
    .count-exit {
        top: 0;
        position: absolute;
        transform: rotateX(0);
    }
    .count-exit-active {
        transform: rotateX(0.5turn);
    }
`;

const CartCount = ({count}) => ( 
    <AnimationStyles>
        <TransitionGroup>
            <CSSTransition 
                unmountOnExit
                className="count" 
                classNames="count"key={count} 
                timeout={{enter: 250, exit: 250}}
            >
                <Dot>{count}</Dot>
            </CSSTransition>
        </TransitionGroup>
    </AnimationStyles>
)

export default CartCount;