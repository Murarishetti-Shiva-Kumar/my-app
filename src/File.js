import axios from "axios";

import React, { Component } from "react";

class File extends Component {
  state = {
    // Initially, no file is selected
    selectedFile: null,
    returnedImage: null,
  };

  // On file select (from the pop up)
  onFileChange = (event) => {
    // Update the state
    this.setState({ selectedFile: event.target.files[0] });
  };

  // On file upload (click the upload button)
  onFileUpload = () => {
    var self = this; // this line is IMPORTANT as you specified which scope you need to focus on
    // Create an object of formData
    const formData = new FormData();

    // Update the formData object
    formData.append(
      "file",
      this.state.selectedFile,
      this.state.selectedFile.name
    );

    // Details of the uploaded file
    // console.log(this.state.selectedFile);
    console.log(formData.get("file"));
    // Request made to the backend api
    // Send formData object
    axios
      .post("http://b9d56c844307.ngrok.io/api/predict/utility", formData)
      .then(function (response) {
        console.log(response);
        // Remember to set state Shiva: here it has self.setState instead of this.setState because it will be confused with axios's scope
        self.setState({
          returnedImage: response.data
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // File content to be displayed after
  // file upload is complete
  fileData = () => {
    if (this.state.selectedFile) {
      return (
        <div>
          <h2>File Details:</h2>
          <p>File Name: {this.state.selectedFile.name}</p>
          <p>File Type: {this.state.selectedFile.type}</p>
          <p>
            Last Modified:{" "}
            {this.state.selectedFile.lastModifiedDate.toDateString()}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose before Pressing the Upload button</h4>
        </div>
      );
    }
  };

  render() {
    //best practice: create a local variable first to refer to global variables and functions
    const fileData = this.fileData();
    const returnedImage = this.state.returnedImage; 
    
    return (
      <div>
        <h1>Community Engagement</h1>
        <h3>File Upload for prediction</h3>
        <div>
          <input type="file" onChange={this.onFileChange} />
          <button onClick={this.onFileUpload}>Upload!</button>
          <img src={'data:image/jpg;base64,' + returnedImage} alt="Logo" />
        </div>
        {fileData}
      </div>
    );
  }
}

export default File;