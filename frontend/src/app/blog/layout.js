import Footer from '@/_components/Footer'
import Navbar from '@/_components/Navbar'
import React from 'react'

const layout = ({children}) => {
  return (
    <div>
      {" "}
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

export default layout
