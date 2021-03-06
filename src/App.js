import React,{Component} from 'react';
import './App.css';

import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register'
const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: '567b2747349547fe8824b4eba4b79bdf'
});
const particleOptions={
  
  particles: {
    line_linked: {
      shadow: {
        enable: true,
          color: "#3CA9D1",
            blur: 5

      }
     
    },
     number: {
      value: 50,
      density:{
        enable:true,
        value_area:800
      }    }
}
}
const initialState={
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}


class App extends Component {
  constructor(){
    super();
    this.state=initialState;
      
  }
  loadUser=(data)=>{
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined

    }
  })
}

  // componentDidMount(){
  //   fetch('http://localhost:3001/')
  //   .then(response => response.json())
  //   .then(console.log)
  // }
  calculateFaceLocation=(data)=>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
    console.log(box);
    this.setState({box: box});
  }
  onInputChange=(event) =>{
    this.setState({input: event.target.value});
    
  }
  onSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }
  
  onRouteChange=(route) =>{
    if(route ==='signin'){
    this.setState(initialState)
    }
    else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route:route});

  }
  render(){ 
  
  
       if(this.state.route === 'signin'){
         return(<div className="App">
          <Particles className="particles" params={particleOptions} />
          <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>  
          <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
          </div>);
      }
      else if(this.state.route==='register'){
       return(
         <div className="App">
          <Particles className="particles" params={particleOptions} />
          <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
          <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} /> </div>);
      }
      else{
      
         
         const newLocal = (<div className="App">
           <Particles className="particles" params={particleOptions} />
           <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
           <Logo />
           <Rank name={this.state.user.name} entries={this.state.user.entries} />
           <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit} />
           
           <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
         </div>);
       return newLocal;   
      }
  

}
}

export default App;
