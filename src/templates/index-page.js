import '../components/all.sass'
import React from 'react'
import { graphql } from 'gatsby'
import { Keyframes, animated } from 'react-spring/renderprops'
import texture from '../img/line-texture-bg-overlay.svg'
import { Menu, Close } from '@material-ui/icons'
import { Typography, Grid } from '@material-ui/core';

const MenuBarAnimation = Keyframes.Spring({
  open: { delay: 0, x: 100 },
  close: { delay: 0, x: 0 },
})

const MenuItemAnimation = Keyframes.Trail({
  open: { x: 0, opacity: 1, delay: 0 },
  close: { x: 100, opacity: 0, delay: 0 },
})

const BackgroundImageAnimation = Keyframes.Spring({
  peek: { opacity: 1, from: { opacity: 0 }, delay: 50 },
  open: { opacity: 1, delay: 1000 },
  close: { opacity: 0, delay: 0 },
})

const TypographyAnimation = Keyframes.Trail({
  peek: { x: 0, from: { x: 100 }, delay: 0 },
  open: { x: 0, from: { x: 100 }, delay: 1000 },
  close: { to: { x: 100 }, from: { x: 0 }, delay: 0 },
})

const menuItemsProps = [
  { en_label: 'About Us', label: '会社概要' },
  { en_label: 'OEM', label: 'OEM' },
  { en_label: 'Shop', label: '販売店' },
  { en_label: 'Recruit', label: '採用情報' },
]

const Menubar = (props) => {
  const items = menuItemsProps.map(menuItemProp => (
    <Typography variant='h6' color='inherit' align='left'>{menuItemProp.label}</Typography>
  ))
  const { x, menuItems, onClickMenubar } = props
  return (
    <animated.div
      className="menubar"
      style={{
        right: x.interpolate(x => `calc(-100vw + ${x}vw)`),
        height: window.innerHeight
      }}
    >
      <div className='menu-close-button-box' onClick={onClickMenubar}>
        <Close color='inherit'/>
      </div>
      <Grid container>
        <Grid item sm={6} xs={12}>
          <div className='logo'>
            <Typography variant='h6' color='inherit' align='center'>Logo</Typography>
          </div>
        </Grid>
        <Grid item sm={6} xs={12}>
          <div className='menu-item-box'>
            <MenuItemAnimation
              native
              items={items}
              keys={items.map((_, i) => i)}
              reverse={menuItems !== 'open'}
              state={menuItems}
            >
              {(item, i) => ({ x, ...props }) => (
                <animated.div
                  style={{
                    transform: x.interpolate(x => `translate3d(${x}%,0,0)`),
                    ...props
                  }}
                  className='menu-item'
                  key={i}
                >
                  {item}    
                </animated.div>
              )}
            </MenuItemAnimation>
          </div>
        </Grid>
      </Grid>
    </animated.div>
  )
}

const Section = (props) => {
  const { section, currentSection, image, typographyItems } = props
  return (
    <div className='section'>
      <BackgroundImageAnimation native state={currentSection === undefined && section === 0 ? 'peek' : currentSection === section ? 'open' : 'close'}>
        {({ opacity }) => (
          <animated.div
            className='left'
            style={{
              opacity: opacity.interpolate(opacity => opacity),
              height: window.innerHeight,
              backgroundImage: `url(${image.childImageSharp.fluid.src})`
            }}
          >
            <div
              className='texture'
              style={{
                background: `url(${texture}) 8px/8px auto repeat`,
                height: window.innerHeight,
              }}
            >
            </div>
          </animated.div>
        )}
      </BackgroundImageAnimation>
      <div
        className='right'
        style={{
          height: window.innerHeight
        }}
      >
        <div>
          <TypographyAnimation
            native
            items={typographyItems}
            keys={typographyItems.map((_, i) => i)}
            reverse={section !== 0}
            state={currentSection === undefined && section === 0 ? 'peek' : currentSection === section ? 'open' : 'close'}
          >
            {(item, i) => ({ x, ...props }) => (
              <div style={{ overflow: 'hidden' }}>
                <animated.div
                  style={{ transform: x.interpolate(x => `translateY(${x}%)`) }}
                  key={i}
                  className='typography'
                >
                  {item}
                </animated.div>
              </div>
            )}
          </TypographyAnimation>
        </div>
      </div>
    </div>
  )
}

export class IndexPageTemplate extends React.Component
{
  state = {
    menubar: 'close',
    menuItems: 'close',
    section: undefined,
    touchStart: undefined,
  }

  smoothScroll = (range, component, collback) => {
      var position = 0
      var progress = 0
      var scrollTop = component.scrollTop
      var easeInOut = (progress) => {
        if (progress < 0.5) {
          let newProgress = progress * 2
          return newProgress * newProgress / 2
        }
        else {
          let newProgress = progress * 2 - 1
          return (2 - newProgress) * newProgress / 2 + 0.5
        }
      }
      var move = function () {
        progress++
        position = range * easeInOut(progress / 100)
        component.scrollTo(0, position + scrollTop)

        if ( (range > 0 && position < range) || (range < 0 && position > range) ) {
            requestAnimationFrame(move);
        }
        else {
          if (collback) {
            collback()
          }
        }
      };
      requestAnimationFrame(move)
  }

  componentDidMount = () => {
    var scrollWrapper = document.getElementById('scroll-wrapper')
    if (scrollWrapper === null) {
      return
    }
    scrollWrapper.onscroll = (event) => {
      if (this.state.touchStart !== undefined) {
        event.preventDefault()
      }
    }
    scrollWrapper.ontouchstart = (event) => {
      if (this.state.scroll === true) {
        event.preventDefault()
        return
      }
      this.setState({ touchStart: event.touches[0].pageY })
    }
    scrollWrapper.ontouchmove = (event) => {
      if (this.state.scroll === true || this.state.touchStart === undefined) {
        event.preventDefault()
        return
      }
      if (this.state.touchStart + 10 < event.touches[0].pageY) {
        let diff = 0 === scrollWrapper.scrollTop % window.innerHeight ? window.innerHeight : scrollWrapper.scrollTop % window.innerHeight
        let section = (scrollWrapper.scrollTop - diff) / window.innerHeight
        section = section === -1 ? 0 : section === 3 ? 2 : section
        this.setState({ scroll: true, touchStart: undefined, section })
        this.smoothScroll(- diff, scrollWrapper, () => {
            this.setState({ scroll: false })
        })
      }
      else if (this.state.touchStart - 10 > event.touches[0].pageY) {
        let section = (scrollWrapper.scrollTop + window.innerHeight - scrollWrapper.scrollTop % window.innerHeight) / window.innerHeight
        this.setState({ scroll: true, touchStart: undefined, section })
        this.smoothScroll(window.innerHeight - scrollWrapper.scrollTop % window.innerHeight, scrollWrapper, () => {
          this.setState({ scroll: false })
        })
      }
    }
    scrollWrapper.ontouchend = (event) => {
      if (this.state.scroll === true) {
        event.preventDefault()
        return
      }
    }
    scrollWrapper.onwheel = (event) => {
      event.preventDefault()
      if (this.state.scroll === true) {
        return
      }
      if (event.deltaY > 0) {
        let section = (scrollWrapper.scrollTop + window.innerHeight - scrollWrapper.scrollTop % window.innerHeight) / window.innerHeight
        this.setState({ scroll: true, section })
        this.smoothScroll(window.innerHeight - scrollWrapper.scrollTop % window.innerHeight, scrollWrapper, () => {
          this.setState({ scroll: false })
        })
      }
      else {
        let diff = 0 === scrollWrapper.scrollTop % window.innerHeight ? window.innerHeight : scrollWrapper.scrollTop % window.innerHeight
        let section = (scrollWrapper.scrollTop - diff) / window.innerHeight
        section = section === -1 ? 0 : section === 3 ? 2 : section
        this.setState({ scroll: true, section })
        this.smoothScroll(- diff, scrollWrapper, () => {
            this.setState({ scroll: false })
        })
      }
    }
  }

  handleClickMenubar = () => {
    if (this.state.menubar === 'open') {
      this.setState({ menubar: 'close', menuItems: 'close' })
    }
    else if (this.state.menubar === 'close') {
      this.setState({ menubar: 'open', menuItems: 'open' })
    }
  }

  render() {
    const { menubar, menuItems, section } = this.state
    const { image1, image2, image3 } = this.props
    const typographyItems = [
      (
        <Typography className='title'>TITLE</Typography>
      ),
      (
        <Typography className='description'>description...................</Typography>
      )
    ]
    return (
      <React.Fragment>
        <div
          id='scroll-wrapper'
          style={{ height: window.innerHeight }}
        >
        <MenuBarAnimation native state={menubar}>
          {({ x }) => (
            <React.Fragment>
              <Menubar x={x} menuItems={menuItems} onClickMenubar={this.handleClickMenubar}/>
              <animated.div
                className='content'
                style={{
                  right: x.interpolate(x => `calc(${x / 2}vw)`),
                  height: window.innerHeight
                }}
              >
                <div className='menu-open-button-box' onClick={this.handleClickMenubar}>
                  <Menu color='inherit'/>
                </div>
                <Section
                  section={0}
                  currentSection={section}
                  image={image1}
                  typographyItems={typographyItems}
                />
                <Section
                  section={1}
                  currentSection={section}
                  image={image2}
                  typographyItems={typographyItems}
                />
                <Section
                  section={2}
                  currentSection={section}
                  image={image3}
                  typographyItems={typographyItems}
                />
              </animated.div>
            </React.Fragment>
          )}
        </MenuBarAnimation>
        </div>
      </React.Fragment>
    )
  }
}

const IndexPage = ({ data }) => {
  const { frontmatter } = data.markdownRemark
  return (
    <IndexPageTemplate
      image1={frontmatter.image1}
      image2={frontmatter.image2}
      image3={frontmatter.image3}
    />
  )
}

export default IndexPage

export const pageQuery = graphql`
  query IndexPageTemplate {
    markdownRemark(frontmatter: { templateKey: { eq: "index-page" } }) {
      frontmatter {
        image1 {
          childImageSharp {
            fluid(maxWidth: 2048, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        image2 {
          childImageSharp {
            fluid(maxWidth: 2048, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        image3 {
          childImageSharp {
            fluid(maxWidth: 2048, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`

