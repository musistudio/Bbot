import { Component } from 'react';
import './index.css';

class Album extends Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            showIndex: 0,
            hiddenIndex: null
        }
        this.inAnimations = ['animate__backInDown', 'animate__backInLeft', 'animate__backInRight', 'animate__backInUp', 'animate__fadeInLeft', 'animate__fadeInRight', 'animate__lightSpeedInRight', 'animate__lightSpeedInLeft', 'animate__lightSpeedInLeft', 'animate__lightSpeedInLeft', 'animate__rollIn', 'animate__zoomIn', 'animate__zoomInDown', 'animate__zoomInLeft', 'animate__zoomInRight', 'animate__zoomInUp'];
        this.outAnimations = ['animate__backOutDown', 'animate__backOutLeft', 'animate__backOutRight', 'animate__backOutUp', 'animate__fadeOutLeft', 'animate__fadeOutRight', 'animate__lightSpeedOutRight', 'animate__lightSpeedOutLeft', 'animate__lightSpeedOutLeft', 'animate__lightSpeedOutLeft', 'animate__rollOut', 'animate__zoomOut', 'animate__zoomOutDown', 'animate__zoomOutLeft', 'animate__zoomOutRight', 'animate__zoomOutUp'];
        this.timer = null;
    }
    componentDidMount() {
        this.getPhotos();
        this.timer = setInterval(() => {
            this.next();
        }, 5000)
    }
    componentWillUnmount() {
        clearInterval(this.timer);
    }
    getPhotos() {
        this.setState({
            photos: [
                'http://192.168.123.98/photos/1.jpeg',
                'http://192.168.123.98/photos/2.jpeg',
                'http://192.168.123.98/photos/3.jpeg',
                'http://192.168.123.98/photos/4.jpeg',
                'http://192.168.123.98/photos/5.jpeg',
            ]
        })
    }
    next() {
        const hiddenIndex = this.state.showIndex;
        const showIndex = (this.state.showIndex + 1) % this.state.photos.length;
        this.setState({
            hiddenIndex
        })
        setTimeout(() => {
            this.setState({
                showIndex
            })
        }, 500)
    }
    render() {
        return <div className="album">
            {
                this.state.photos.map((photo, index) => {
                    return <img src={photo} alt="" key={index} className={'animate__animated ' + (this.state.showIndex === index ? `active ${this.inAnimations[Math.floor(Math.random() * this.inAnimations.length)]}` : '') + (this.state.hiddenIndex === index ? ` ${this.outAnimations[Math.floor(Math.random() * this.outAnimations.length)]}` : '')} />
                })
            }
        </div>
    }
}

export default Album;