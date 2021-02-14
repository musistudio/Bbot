import React from 'react';
import dayjs from 'dayjs';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { setNetworkState } from '../../actions';
import { checkNetwork } from '../../utils/request';
import './index.css';

const mapStateToProps = state => {
    return {
        network: state.network
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setNetworkState: state => {
            dispatch(setNetworkState(state))
        }
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: '',
            timer: null
        };
        this.week = ['日', '一', '二', '三', '四', '五', '六'];
        this.setNetworkState();
    }
    componentDidMount() {
        this.setState({
            timer: setInterval(() => {
                this.now()
            }, 1000)
        })
    }
    componentWillUnmount() {
        clearInterval(this.state.timer);
    }
    now() {
        const now = new Date();
        const day = `周${this.week[now.getDay()]}`;
        const time = dayjs().format('M月DD日 h:mm:ss').split(' ');
        time[1] = `${now.getHours() < 12 ? '上午' : '下午'}${time[1]}`;
        time.splice(1, 0, day);
        this.setState({
            time: time.join(' ')
        })
    }
    async setNetworkState() {
        const state = await checkNetwork();
        this.props.setNetworkState(state);
    }
    render() {
        return <div className="header">
            <div className="area">
                杭州
                <i className={'wifi-state iconfont ' + (this.props.network ? 'icon-xinhao' : 'icon-wangluo')}></i>
            </div>
            <div className="time">{this.state.time}</div>
        </div>
    }
}

Header.propTypes = {
    network: propTypes.bool.isRequired
}

const withNetworkHeader = connect(mapStateToProps, mapDispatchToProps)(Header);


export default withNetworkHeader;