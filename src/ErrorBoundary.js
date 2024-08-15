import React, { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error:''
    }
  }

  componentDidCatch(error, errorInfo) {
    console.log('Logging', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
      <div style={{display:'flex', flexDirection:'column', height: '100vh', justifyContent:'center', alignItems:'center'}}>
        <span><i className="bx bx-dizzy font-size-16 align-middle me-2"></i> Ooops....Something went wrong. Click button below to go back</span>
        <code>{this.state.error}</code>

        <button type="button" className="btn btn-primary mt-2"  onClick={() => {
          history.go(-1); 
          setTimeout(() => {
            window.location.reload()
          }, 100)
        }}><i className="bx bx-left-arrow-alt font-size-16 align-middle me-2"></i> Click to go Back</button>
      
       
     </div>)
    }
    return this.props.children
  }
}

export default ErrorBoundary