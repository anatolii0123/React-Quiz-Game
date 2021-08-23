import React, { Component } from 'react'
import { Carousel } from 'react-bootstrap'

export default class MyHome extends Component {
  render() {
    const height = window.innerHeight, width = window.innerWidth
    return <Carousel style={{ height: '100%' }}>
      <Carousel.Item interval={4000}>
        <img
          className="d-block"
          style={{ width: `${width}px`, height: `${height}px` }}
          src="/Quiz/1495315685183.jpg"
          alt="Second slide"
        />
        <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item interval={4000}>
        <img
          className="d-block"
          style={{ width: `${width}px`, height: `${height}px` }}
          src="/Quiz/banner-23.jpg"
          alt="Second slide"
        />
        <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item interval={4000}>
        <img
          className="d-block"
          style={{ width: `${width}px`, height: `${height}px` }}
          src="/Quiz/education-technology-and-school-children.jpg"
          alt="Third slide"
        />
        <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  }
}