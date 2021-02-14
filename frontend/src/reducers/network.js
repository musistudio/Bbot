
const network = (state = false, action) => {
    switch(action.type) {
        case 'SET_NETWORK_STATE':
            return action.state;
        default:
            return state;
    }
}

export default network;