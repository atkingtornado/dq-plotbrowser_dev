import React, { Component } from 'react';
import PropTypes from "prop-types";
import { push as Menu } from 'react-burger-menu'
import { default as ReactSelect } from "react-select";
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import Lightbox from 'react-images';
import { Scrollbars } from 'react-custom-scrollbars';
import './App.css';
import 'react-tippy/dist/tippy.css';
import { Tooltip } from 'react-tippy';
import Clipboard from 'react-clipboard.js';

import Modal from 'react-responsive-modal';

import queryString from 'query-string'





//Extend Select module to allow user to select "all"
const Select = props => { 
  if (props.allowSelectAll) {
    if ((props.value.length === props.options.length) && props.value.length>1) {
      return (
        <ReactSelect
          {...props}
          value={[props.allOption]}
          onChange={(selected, { action }) => { props.onChange(selected.slice(1), action)}}
        />
      );
    }

    return (
      <ReactSelect
        {...props}
        options={[props.allOption, ...props.options]}
        onChange={(selected, { action }) => {
          if (
            selected.length > 0 &&
            selected[selected.length - 1].value === props.allOption.value
          ) {
            return props.onChange(props.options, action);
          }
          return props.onChange(selected, action);
        }}
      />
    );
  }

  return <ReactSelect {...props} />;
};
Select.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  allowSelectAll: PropTypes.bool,
  allOption: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })
};
Select.defaultProps = {
  allOption: {
    label: "All",
    value: "*"
  }
};

// Define all constants to be used throughout the app
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    'border': state.isFocused ? 'none' : 'none',
    'box-shadow': state.isFocused ? 'none' : 'none',
    'cursor': 'pointer'
  }),
  option: (base, state) => ({
    ...base,
    'cursor': 'pointer',
    'backgroundColor': state.isDisabled ? null: state.isSelected ? 'rgba(75, 95, 115, 0.2)' : state.isFocused ? 'rgba(75, 95, 115, 0.05)' : null,
    'color': '#000000'
  })
}

const customLightboxStyles = {
  container: {
    background: 'rgba(0, 0, 0, 0.8)',
  },
}

const placeholderURL = 'http://via.placeholder.com/2000x1200'

const dummyMenuData = {
  'site01':{
    'class01':{
      'facility01':{
        'level01':['plotType1', 'plotType2', 'plotType3']
      },
    }
  },
  'site02':{
    'class01':{
      'facility01':{
        'level01':['plotType1', 'plotType2', 'plotType3']
      },
    },
    'class02':{
      'facility01':{
        'level01':['plotType1', 'plotType2', 'plotType3']
      },
      'facility02':{
        'level01':['plotType1', 'plotType2', 'plotType3'],
        'level02':['plotType1', 'plotType2', 'plotType3']
      },
    },
  },
  'site03':{
    'class01':{
      'facility01':{
        'level01':['plotType1', 'plotType2', 'plotType3']
      },
    },
    'class02':{
      'facility01':{
        'level01':['plotType1', 'plotType2', 'plotType3']
      },
      'facility02':{
        'level01':['plotType1', 'plotType2', 'plotType3'],
        'level02':['plotType1', 'plotType2', 'plotType3']
      }
    },
    'class03':{
      'facility01':{
        'level01':['plotType1', 'plotType2', 'plotType3']
      },
      'facility02':{
        'level01':['plotType1', 'plotType2', 'plotType3'],
        'level02':['plotType1', 'plotType2', 'plotType3']
      },
      'facility03':{
        'level01':['plotType1', 'plotType2', 'plotType3'],
        'level02':['plotType1', 'plotType2', 'plotType3'],
        'level03':['plotType1', 'plotType2', 'plotType3']
      }
    },
  },
}

const testData = { 
'thumb':
  [],
'list':
  []
}

function genDummyPlotData(request){
  let data = []
  let dates = []
  let start = request.sdate.clone()
  let end = request.edate.clone()

  for (var d = start; d.diff(end, 'days') <= 0; d.add(1, 'days')) {
    dates.push(d.format('YYYYMMDD'));
  }

  for(var i=0;i<request.sites.length;i++){
    let currSite = request.sites[i]
    for(var j=0;j<request.classes.length;j++){
      let currClass = request.classes[j]
      //Check if class exists for site
      if(currClass in dummyMenuData[currSite]){
        for(var k=0;k<request.facilities.length;k++){
          let currFacility = request.facilities[k]
          //check if facility exists for site + class
          if(currFacility in dummyMenuData[currSite][currClass]){
            for(var l=0;l<request.levels.length;l++){
              let currLevel = request.levels[l]
              //check if level exists for site + class + level
              if(currLevel in dummyMenuData[currSite][currClass][currFacility]){
                let plottypesData=[]

                for(var m=0;m<request.plottypes.length;m++){
                  let currPlottype = request.plottypes[m]
                  //check if plottype exists for site + class + level + plottype
                  if(dummyMenuData[currSite][currClass][currFacility][currLevel].includes(currPlottype)){
                    plottypesData.push({
                      'plotType': currPlottype,
                      'data': dates.map((date, i) => ({ url: placeholderURL, date: date })),
                    })
                  }
                }
                console.log(dates)
                data.push({
                  'datastreamName': currSite+currClass+currFacility+'.'+currLevel,
                  'plotTypes':plottypesData
                })
              }
            }
          }
        }
      }
    }
  }

  let newData = {
    'thumb':data,
    'list':[]
  }
  return newData
}

function uniqueArray(arrArg) {
  return arrArg.filter(function(elem, pos,arr) {
    return arr.indexOf(elem) === pos;
  });
};

// Main
class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      plotData:    testData,
      displayType: 'thumb',
      shareLink: '',
    }
    this.handleDisplayChange = this.handleDisplayChange.bind(this);
    this.displayPlots = this.displayPlots.bind(this);
    this.updateShareLink = this.updateShareLink.bind(this)
  }

  componentDidMount(){
    // console.log(this.props)
  }

  handleDisplayChange(e) {
    console.log(e.currentTarget.id)
    this.setState(
      { displayType: e.currentTarget.id}
    );
  }
  
  showSettings (event) {
    event.preventDefault();
  }

  displayPlots(data){
    this.setState({
      plotData: data
    })
  }

  updateShareLink(selectedOptions){

    console.log(window.location)

    let newURL = window.location.protocol + '//' + window.location.host + window.location.pathname + '?'
    for(let i=0; i<selectedOptions.sites.length;i++){
      newURL = newURL + 's='+selectedOptions.sites[i]+'&'
    }
    for(let i=0; i<selectedOptions.classes.length;i++){
      newURL = newURL + 'c='+selectedOptions.classes[i]+'&'
    }
    for(let i=0; i<selectedOptions.facilities.length;i++){
      newURL = newURL + 'f='+selectedOptions.facilities[i]+'&'
    }
    for(let i=0; i<selectedOptions.levels.length;i++){
      newURL = newURL + 'l='+selectedOptions.levels[i]+'&'
    }
    for(let i=0; i<selectedOptions.plottypes.length;i++){
      newURL = newURL + 'p='+selectedOptions.plottypes[i]+'&'
    }

    newURL = newURL + 'sd='+selectedOptions.sdate.format('YYYYMMDD')+'&'
    newURL = newURL + 'ed='+selectedOptions.edate.format('YYYYMMDD')+'&'

    console.log(selectedOptions)

    this.setState({
      shareLink: newURL
    })
  }
  
  render () {

    let queryStringObj = queryString.parse(this.props.location.search)
    let hasQueryString = false

    try{
      hasQueryString = queryStringObj.s.length>0 && queryStringObj.c.length>0 && queryStringObj.f.length>0 && queryStringObj.l.length>0 && queryStringObj.p.length>0 && queryStringObj.sd !== "" && queryStringObj.ed !== "";
    }
    catch(e){}
    
    return (
      <div id="outer-container">
        <Menu isOpen noOverlay pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" }>
          <div className='menu-options'>

            <PlotSelectMenu
              onDisplayChange = {this.handleDisplayChange}
              displayPlots    = {this.displayPlots}
              queryString     = {queryStringObj}
              hasQueryString  = {hasQueryString}
              updateShareLink = {this.updateShareLink}
            />

          </div>
        </Menu>
        <div className='sidebar'>
          <ShareButton shareLink={this.state.shareLink}/>
        </div>
        <main id="page-wrap">
          
          <div className='plot-area'>
          <Scrollbars className='plot-area-scroll' style={{ width: '100%', height: '100%'}} >
            <PlotDisplay 
              plotDisplayData = {this.state.plotData[this.state.displayType]}
              plotDisplayType = {this.state.displayType}
            /> 
            </Scrollbars>
          </div>
          
        </main>
      </div>
    );
  }
}

class ShareButton extends Component{
  constructor(props){
    super(props)

    this.state = {
      isShowingModal: false,
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClick(){
    this.setState({isShowingModal: true})
  }

  handleClose(){
    this.setState({isShowingModal: false})
  }

  render(){
    return <div>
      <i onClick={this.handleClick} className="fas fa-2x fa-share-alt share"></i>
        <Modal open={this.state.isShowingModal} onClose={this.handleClose} classNames={{ overlay: 'share-overlay', modal: 'share-modal', closeButton:'share-close-button', closeIcon:'share-close-icon'}} center>
          <h3>Share Link</h3>
          <div className="buttonInside">
            <input readOnly value={this.props.shareLink} className='share-link'/>


              <Clipboard data-clipboard-text={this.props.shareLink} className='share-link-button'>
                <Tooltip
                title="Link Copied"
                position="bottom"
                trigger="click"
                arrow="true"
                duration='50'
              >
                <i className="fa fa-clipboard fa-lg"></i>
                </Tooltip>
              </Clipboard>
            
          </div>
        </Modal>
      {/* {this.state.isShowingModal &&
     <ModalContainer onClose={this.handleClose}>
        <ModalDialog onClose={this.handleClose}>
          <h1>Share Link</h1>
          <div className='share-link-div'>
            <input className='share-link'></input>
             <Clipboard data-clipboard-text="I'll be copied" className='share-link-button'>
              <i class="fas fa-clipboard fa-2x"></i>
            </Clipboard>
          </div>
         <div className="buttonInside">
            <input className='share-link'/>

            <Clipboard data-clipboard-text="I'll be copied" className='share-link-button'>
              <i className="fa fa-clipboard fa-lg"></i>
            </Clipboard>
          </div>
        </ModalDialog>
      </ModalContainer>}*/}
    </div>
  }
}

// Primary sliding menu UI component
class PlotSelectMenu extends Component {

  constructor(props) {

    super(props);
    this.state = {
      selectedSites:          [],
      selectedClasses:        [],
      selectedFacilities:     [],
      selectedLevels:         [],
      selectedPlottypes:      [],
      siteOptions:            [],
      classOptions:           [],
      facilityOptions:        [],
      levelOptions:           [],
      plottypeOptions:        [],
      siteIsDisabled:         true,
      siteAllowSelectAll:     false,
      classIsDisabled:        true,
      classAllowSelectAll:    false,
      facilityIsDisabled:     true,
      facilityAllowSelectAll: false,
      levelIsDisabled:        true,
      levelAllowSelectAll:    false,
      plottypeIsDisabled:     true,
      plottypeAllowSelectAll: false,
      getPlotsIsDisabled:     true,
      shiftKeyIsPressed:      false,
      closeOnSelect:          true,
      showDateArrows:         false,
      dateArrowNumDays:       1,
      sitePlaceholder:        '--',
      classPlaceholder:       '--',
      facilityPlaceholder:    '--',
      levelPlaceholder:       '--',
      plottypePlaceholder:    '--',
      startDate:              moment().startOf('day'),
      endDate:                moment().startOf('day'),
      plotRequestData:        '',
    };
    this.handleSiteChange       = this.handleSiteChange.bind(this);
    this.handleClassChange      = this.handleClassChange.bind(this);
    this.handleFacilityChange   = this.handleFacilityChange.bind(this);
    this.handleLevelChange      = this.handleLevelChange.bind(this);
    this.handlePlottypeChange   = this.handlePlottypeChange.bind(this);
    this.handleDateChange       = this.handleDateChange.bind(this);
    this.handleKeyDown          = this.handleKeyDown.bind(this);
    this.handleKeyUp            = this.handleKeyUp.bind(this);
    this.handleDateArrowClick   = this.handleDateArrowClick.bind(this);
    this.updateMenu             = this.updateMenu.bind(this);
    this.getPlots               = this.getPlots.bind(this);
  }

  componentDidMount(){
    console.log(this.props.hasQueryString)
    if(this.props.hasQueryString){
      let querySelectedSites      = Array.isArray(this.props.queryString.s) ? this.props.queryString.s.map((str, i) => ({ value: str, label: str })) : [this.props.queryString.s].map((str, i) => ({ value: str, label: str }))
      let querySelectedClasses    = Array.isArray(this.props.queryString.c) ? this.props.queryString.c.map((str, i) => ({ value: str, label: str })) : [this.props.queryString.c].map((str, i) => ({ value: str, label: str }))
      let querySelectedFacilities = Array.isArray(this.props.queryString.f) ? this.props.queryString.f.map((str, i) => ({ value: str, label: str })) : [this.props.queryString.f].map((str, i) => ({ value: str, label: str }))
      let querySelectedLevels     = Array.isArray(this.props.queryString.l) ? this.props.queryString.l.map((str, i) => ({ value: str, label: str })) : [this.props.queryString.l].map((str, i) => ({ value: str, label: str }))
      let querySelectedPlottypes  = Array.isArray(this.props.queryString.p) ? this.props.queryString.p.map((str, i) => ({ value: str, label: str })) : [this.props.queryString.p].map((str, i) => ({ value: str, label: str }))

      console.log()

      this.setState({
        siteOptions: Object.keys(dummyMenuData).map((site, i) => ({ value: site, label: site })) ,
        siteIsDisabled: false,
        siteAllowSelectAll: true,
        selectedSites: querySelectedSites,
        startDate: moment(this.props.queryString.sd),
        endDate: moment(this.props.queryString.ed),
      },()=>{
        this.updateMenu(querySelectedSites, 'site', 'queryadd')
        this.setState({
          selectedClasses: querySelectedClasses,
        }, ()=>{
          this.updateMenu(querySelectedClasses, 'class', 'queryadd')
          this.setState({
            selectedFacilities: querySelectedFacilities,
          }, ()=>{
            this.updateMenu(querySelectedFacilities, 'facility', 'queryadd')
            this.setState({
              selectedLevels: querySelectedLevels,
            }, ()=>{
              this.updateMenu(querySelectedLevels, 'level', 'queryadd')
              this.setState({
                selectedPlottypes: querySelectedPlottypes,
              }, ()=>{
                this.updateMenu(querySelectedPlottypes, 'plottype', 'queryadd', true)
              })
            })
          })
        })
      })
      // this.getPlots()
    }
    else{
      this.setState({
        sitePlaceholder: 'Select Site...',
        siteOptions: Object.keys(dummyMenuData).map((site, i) => ({ value: site, label: site })) ,
        siteIsDisabled: false,
        siteAllowSelectAll: true,
      })
    }
    
  }

  updateMenu(selectedOptions, selectName, action, getPlots=false){

    let actionIsClear = action === 'clear' || action === 'remove-value'
    let actionIsQuery = action === 'queryadd'

    let currSelectedSites      = (selectName === 'site')     ? selectedOptions.map((siteObj, i) => (siteObj.value))         : this.state.selectedSites.map((siteObj, i) => (siteObj.value))
    let currSelectedClasses    = (selectName === 'class')    ? selectedOptions.map((classObj, i) => (classObj.value))       : this.state.selectedClasses.map((classObj, i) => (classObj.value))
    let currSelectedFacilities = (selectName === 'facility') ? selectedOptions.map((facilityObj, i) => (facilityObj.value)) : this.state.selectedFacilities.map((facilityObj, i) => (facilityObj.value))
    let currSelectedLevels     = (selectName === 'level')    ? selectedOptions.map((levelObj, i) => (levelObj.value))       : this.state.selectedLevels.map((levelObj, i) => (levelObj.value))
    let currSelectedPlottypes  = (selectName === 'plottype') ? selectedOptions.map((plottypeObj, i) => (plottypeObj.value)) : this.state.selectedPlottypes.map((plottypeObj, i) => (plottypeObj.value))

    let newSites      = []
    let newClasses    = [] 
    let newFacilities = []
    let newLevels     = []
    let newPlottypes  = []

    let classOptions    = []
    let facilityOptions = []
    let levelOptions    = []
    let plottypeOptions = []


    for(var i=0; i<currSelectedSites.length; i++){
      newSites.push(currSelectedSites[i])
      classOptions = classOptions.concat(Object.keys(dummyMenuData[currSelectedSites[i]]).map((classStr) => (classStr)) )
      for(var j=0; j<currSelectedClasses.length; j++){
        if(currSelectedClasses[j] in dummyMenuData[currSelectedSites[i]]){
          newClasses.push(currSelectedClasses[j])
          facilityOptions = facilityOptions.concat(Object.keys(dummyMenuData[currSelectedSites[i]][currSelectedClasses[j]]))
          for(var k=0; k<currSelectedFacilities.length; k++){
            if(currSelectedFacilities[k] in dummyMenuData[currSelectedSites[i]][currSelectedClasses[j]]){
              newFacilities.push(currSelectedFacilities[k])
              levelOptions = levelOptions.concat(Object.keys(dummyMenuData[currSelectedSites[i]][currSelectedClasses[j]][currSelectedFacilities[k]]))
              for(var l=0; l<currSelectedLevels.length; l++){          
                if(currSelectedLevels[l] in dummyMenuData[currSelectedSites[i]][currSelectedClasses[j]][currSelectedFacilities[k]]){
                  newLevels.push(currSelectedLevels[l])
                  plottypeOptions = plottypeOptions.concat(dummyMenuData[currSelectedSites[i]][currSelectedClasses[j]][currSelectedFacilities[k]][currSelectedLevels[l]])
                  for(var m=0; m<currSelectedPlottypes.length; m++){
                    if(dummyMenuData[currSelectedSites[i]][currSelectedClasses[j]][currSelectedFacilities[k]][currSelectedLevels[l]].includes(currSelectedPlottypes[m])){
                      newPlottypes.push(currSelectedPlottypes[m])
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    let classHasOptions    = classOptions.length > 0 
    let facilityHasOptions = facilityOptions.length > 0
    let levelHasOptions    = levelOptions.length > 0
    let plottypeHasOptions = plottypeOptions.length > 0

    let newPlotRequestData = {
      sites: uniqueArray(newSites),
      classes:  uniqueArray(newClasses),
      facilities: uniqueArray(newFacilities),
      levels: uniqueArray(newLevels),
      plottypes: uniqueArray(newPlottypes),
      sdate: this.state.startDate,
      edate: this.state.endDate,
    }

    this.props.updateShareLink(newPlotRequestData)

    this.setState({
      selectedSites:          uniqueArray(newSites).map((siteStr, i) =>            ({ value: siteStr, label: siteStr })),
      selectedClasses:        uniqueArray(newClasses).map((classStr, i) =>         ({ value: classStr, label: classStr })),
      selectedFacilities:     uniqueArray(newFacilities).map((facilityStr, i) =>   ({ value: facilityStr, label: facilityStr })),
      selectedLevels:         uniqueArray(newLevels).map((levelStr, i) =>          ({ value: levelStr, label: levelStr })),
      selectedPlottypes:      uniqueArray(newPlottypes).map((plottypeStr, i) =>    ({ value: plottypeStr, label: plottypeStr })),
      classOptions:           uniqueArray(classOptions).map((classStr, i) =>       ({ value: classStr, label: classStr })),
      facilityOptions:        uniqueArray(facilityOptions).map((facilityStr, i) => ({ value: facilityStr, label: facilityStr })),
      levelOptions:           uniqueArray(levelOptions).map((levelStr, i) =>       ({ value: levelStr, label: levelStr })),
      plottypeOptions:        uniqueArray(plottypeOptions).map((plottypeStr, i) => ({ value: plottypeStr, label: plottypeStr })),
      classIsDisabled:        classHasOptions    ? false : true,
      facilityIsDisabled:     facilityHasOptions ? false : true,
      levelIsDisabled:        levelHasOptions    ? false : true,
      plottypeIsDisabled:     plottypeHasOptions ? false : true,
      classAllowSelectAll:    classHasOptions    ? true : false,
      facilityAllowSelectAll: facilityHasOptions ? true : false,
      levelAllowSelectAll:    levelHasOptions    ? true : false,
      plottypeAllowSelectAll: plottypeHasOptions ? true : false,
      classPlaceholder:       classHasOptions    ? 'Select Class...' : '--',  
      facilityPlaceholder:    facilityHasOptions ? 'Select Facility...' : '--',
      levelPlaceholder:       levelHasOptions    ? 'Select Level...' : '--',  
      plottypePlaceholder:    plottypeHasOptions ? 'Select Plot Type...' : '--',  
      getPlotsIsDisabled:     uniqueArray(newPlottypes).length > 0   ? false : true,
      plotRequestData: newPlotRequestData,
    }, () => {
      if(!actionIsQuery && !actionIsClear && facilityHasOptions && newFacilities.length === 0){
        this.updateMenu(facilityOptions.map((facilityStr, i) => ({ value: facilityStr, label: facilityStr })), 'facility')
      }
      else if(!actionIsQuery && !actionIsClear && levelHasOptions && newLevels.length === 0){
        this.updateMenu(levelOptions.map((levelStr, i) => ({ value: levelStr, label: levelStr })), 'level')
      }
      else if(!actionIsQuery && !actionIsClear && plottypeHasOptions && newPlottypes.length === 0){
        this.updateMenu(plottypeOptions.map((plottypeStr, i) => ({ value: plottypeStr, label: plottypeStr })), 'plottype')
      }

      if(getPlots){
        this.getPlots()
      }
    });

  }

  handleSiteChange(selectedOptions, action){
    this.updateMenu(selectedOptions, 'site', action)
  }
  handleClassChange(selectedOptions, action) {
    this.updateMenu(selectedOptions, 'class', action)
  }
  handleFacilityChange(selectedOptions, action) {
    this.updateMenu(selectedOptions, 'facility', action)
  }
  handleLevelChange(selectedOptions, action) {
    this.updateMenu(selectedOptions, 'level', action)
  }
  handlePlottypeChange(selectedOptions, action) {
    this.updateMenu(selectedOptions, 'plottype', action)
  }

  handleDateChange({startDate, endDate}){
    console.log('DATE CHANGE')
    startDate = startDate || this.state.startDate
    endDate = endDate || this.state.endDate

    if (startDate.isAfter(endDate)) {
      endDate = startDate
    }

    let newPlotRequestData = {
      sites: this.state.selectedSites.map((siteObj, i) => (siteObj.value)),
      classes: this.state.selectedClasses.map((classObj, i) => (classObj.value)),
      facilities: this.state.selectedFacilities.map((facilityObj, i) => (facilityObj.value)),
      levels: this.state.selectedLevels.map((levelObj, i) => (levelObj.value)),
      plottypes: this.state.selectedPlottypes.map((typeObj, i) => (typeObj.value)),
      sdate: startDate.startOf('day'),
      edate: endDate.startOf('day'),
    }

    this.setState({ 
      startDate: startDate, 
      endDate: endDate,
      plotRequestData: newPlotRequestData
    })

    this.props.updateShareLink(newPlotRequestData)
  }

  handleDateArrowClick(direction, numDays, e){
    console.log(direction, numDays)
    //d.add(1, 'days')

    let newSdate = direction === 'left' ? this.state.startDate.clone().subtract(numDays, 'days') : this.state.startDate.clone().add(numDays, 'days')
    let newEdate = direction === 'left' ? this.state.endDate.clone().subtract(numDays, 'days') : this.state.endDate.clone().add(numDays, 'days')

    let newPlotRequestData = {
      sites: this.state.selectedSites.map((siteObj, i) => (siteObj.value)),
      classes: this.state.selectedClasses.map((classObj, i) => (classObj.value)),
      facilities: this.state.selectedFacilities.map((facilityObj, i) => (facilityObj.value)),
      levels: this.state.selectedLevels.map((levelObj, i) => (levelObj.value)),
      plottypes: this.state.selectedPlottypes.map((typeObj, i) => (typeObj.value)),
      sdate: newSdate.startOf('day'),
      edate: newEdate.startOf('day'),
    }

    this.setState({ 
      startDate: newSdate, 
      endDate: newEdate,
      plotRequestData: newPlotRequestData
    },this.getPlots)

    this.props.updateShareLink(newPlotRequestData)
  }

  handleKeyDown(e) {
    if(e.shiftKey){
      this.setState({
        closeOnSelect: false,
        shiftKeyIsPressed: true
      });
    }
  }

  handleKeyUp(e) {
    if(this.state.shiftKeyIsPressed){
      this.setState({
        closeOnSelect: true,
        shiftKeyIsPressed: false
      });
    }
  }
  

  getPlots() {
    let data = genDummyPlotData(this.state.plotRequestData)
    this.props.displayPlots(data)
    this.setState({
      showDateArrows: true,
      dateArrowNumDays: this.state.endDate.diff(this.state.startDate, 'days')+1
    })
  }


  render() {
    return <div tabIndex="0" onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} style={{height:'100%'}}>
    <div className='menu-header'>
      <h1 style={{display: 'inline-block'}}>Request Options</h1>
      <Tooltip
        title="Shift-Click to select <br>multiple options at once."
        >
        <i className="fas fa-info-circle fa-lg tooltip"></i>
      </Tooltip>
    </div>
    <div className='menu-options-scroll'>
      <Scrollbars style={{ width: '100%', height: '100%'}} >
        <div className='menu-options-inner'>
          {/*<div style={{'paddingBottom': '20px'}}>
            <p className='menu-options-label'>DATASTREAM</p>
            <PlotSelectMenuOption
              name = 'datastream'
              onChange = {this.state.onDatastreamChange}
              defaultValue = {this.state.datastreamOptions[0]}
              options = {this.state.datastreamOptions}
              disabled = {this.state.datastreamIsDisbaled}
            />
          </div>*/}
          <div style={{'paddingBottom': '20px',}}>
            <p className='menu-options-label'>SITE</p>
            <PlotSelectMenuOption
              name = 'site'
              onChange = {this.handleSiteChange}
              isMulti={true}
              // defaultValue = {this.state.siteOptions[0]}
              options = {this.state.siteOptions}
              disabled = {this.state.siteIsDisabled}
              placeholder = {this.state.sitePlaceholder}
              value = {this.state.selectedSites}
              closeOnSelect = {this.state.closeOnSelect}
              allowSelectAll = {this.state.siteAllowSelectAll}
            />
            <p className='menu-options-label'>DATASTREAM CLASS</p>
            <PlotSelectMenuOption
              name = 'class'
              isMulti={true}
              onChange = {this.handleClassChange}
              defaultValue = {this.state.classOptions[0]}
              options = {this.state.classOptions}
              disabled = {this.state.classIsDisabled}
              placeholder = {this.state.classPlaceholder}
              value = {this.state.selectedClasses}
              closeOnSelect = {this.state.closeOnSelect}
              allowSelectAll = {this.state.classAllowSelectAll}
            />
            <p className='menu-options-label'>FACILITY</p>
            <PlotSelectMenuOption
              name = 'facility'
              isMulti={true}
              onChange = {this.handleFacilityChange}
              defaultValue = {this.state.facilityOptions[0]}
              options = {this.state.facilityOptions}
              disabled = {this.state.facilityIsDisabled}
              placeholder = {this.state.facilityPlaceholder}
              value = {this.state.selectedFacilities}
              closeOnSelect = {this.state.closeOnSelect}
              allowSelectAll = {this.state.facilityAllowSelectAll}
            />
            <p className='menu-options-label'>LEVEL</p>
            <PlotSelectMenuOption
              name = 'level'
              isMulti={true}
              onChange = {this.handleLevelChange}
              defaultValue = {this.state.levelOptions[0]}
              options = {this.state.levelOptions}
              disabled = {this.state.levelIsDisabled}
              placeholder = {this.state.levelPlaceholder}
              value = {this.state.selectedLevels}
              closeOnSelect = {this.state.closeOnSelect}
              allowSelectAll = {this.state.levelAllowSelectAll}
            />
            <p className='menu-options-label'>PLOT TYPE</p>
            <PlotSelectMenuOption
              name = 'plottype'
              isMulti={true}
              onChange = {this.handlePlottypeChange}
              defaultValue = {this.state.plottypeOptions[0]}
              options = {this.state.plottypeOptions}
              disabled = {this.state.plottypeIsDisabled}
              placeholder = {this.state.plottypePlaceholder}
              value = {this.state.selectedPlottypes}
              closeOnSelect = {this.state.closeOnSelect}
              allowSelectAll = {this.state.plottypeAllowSelectAll}
            />
          </div>
          <DateRange
            dateChange = {this.handleDateChange}
            startDate = {this.state.startDate}
            endDate = {this.state.endDate}
          />
          {/*<PlotDisplaySwitch
            onChange = {this.props.onDisplayChange}
          />*/}
          <GetPlotsButton
            disabled = {this.state.getPlotsIsDisabled}
            onClick = {this.getPlots}
          />
          { this.state.showDateArrows ?
          <div className='date-arrow-div'>
            <NextDateArrow
              direction='left'
              numDays={this.state.dateArrowNumDays}
              onClick={this.handleDateArrowClick}
            />
            <NextDateArrow
              direction='right'
              numDays={this.state.dateArrowNumDays}
              onClick={this.handleDateArrowClick}
            />
          </div>
          : null}
        </div>
      </Scrollbars>
      </div>
  </div>
  }
}

class PlotSelectMenuOption extends Component {

  render () {
    return (
      <Select
        closeMenuOnSelect={this.props.closeOnSelect}
        isMulti={this.props.isMulti}
        styles={customSelectStyles}
        name={this.props.name}
        placeholder={this.props.placeholder}
        defaultValue={this.props.defaultValue}
        onChange={this.props.onChange}
        options={this.props.options}
        isDisabled={this.props.disabled}
        value={this.props.value}
        allowSelectAll={this.props.allowSelectAll}
      />
    )
  }
}

class DateRange extends React.Component {

  handleChangeStart = (startDate) => this.props.dateChange({ startDate })
  handleChangeEnd = (endDate) => this.props.dateChange({ endDate })

  render () {
    return <div>
      <div id='sdate-div'>
        <p className='menu-options-label'>START DATE</p>
        <DatePicker
          selected={this.props.startDate}
          selectsStart
          startDate={this.props.startDate}
          endDate={this.props.endDate}
          onChange={this.handleChangeStart}
          className="date-input"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>
      <div id='edate-div'>
        <p className='menu-options-label'>END DATE</p>
        <DatePicker
          selected={this.props.endDate}
          selectsEnd
          startDate={this.props.startDate}
          endDate={this.props.endDate}
          onChange={this.handleChangeEnd} 
          className="date-input"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>
    </div>
  }
}

class PlotDisplaySwitch extends React.Component {

  render() {
    return <div className='plot-display-toggles'>
      <p className='menu-options-label'>DISPLAY STYLE</p>
        <input onChange={this.props.onChange} id="list" className="toggle toggle-left" name="toggle" type="radio"/>
        <label htmlFor="list" className="btn">List</label>
        <input onChange={this.props.onChange} id="thumb" className="toggle toggle-right" name="toggle" type="radio" defaultChecked/>
        <label htmlFor="thumb" className="btn">Thumb</label>
    </div>
  }
  
}

class GetPlotsButton extends React.Component {

  render(){
    return <div className='plot-menu-button-div'>
      <button disabled={this.props.disabled} onClick={this.props.onClick} className='plot-menu-button'>Get Plots</button>
    </div>
  }
}

class NextDateArrow extends React.Component {
  render() {
    let divClass  = this.props.direction + '-arrow'
    let iconClass = "fa fa-arrow-circle-" + this.props.direction + " fa-2x date-arrow-icon"
    let arrowText = this.props.direction === 'left' ? 'prev ' + this.props.numDays + ' days' : 'next ' + this.props.numDays + ' days'
    if(this.props.numDays === 1){
      arrowText = this.props.direction === 'left' ? 'prev day' : 'next day'
    }

    return <div onClick={(e) => this.props.onClick(this.props.direction, this.props.numDays, e)} className={divClass}>
      {this.props.direction === 'left' ? <i className={iconClass} aria-hidden="true"></i> : <p className='date-arrow-text'>{arrowText}</p>}
      {this.props.direction === 'left' ? <p className='date-arrow-text'>{arrowText}</p>   : <i className={iconClass} aria-hidden="true"></i>}
    </div>
  }
}

class PlotDisplay extends React.Component {

  render() {

    if(this.props.plotDisplayType === 'thumb'){
      return this.props.plotDisplayData.map((sectionData, i) => (
          <div key={sectionData.datastreamName} className='plot-section'>
            <p className='plot-section-label'>Datastream: {sectionData.datastreamName}</p>
            <div className='plot-section-wrapper'>
              <PlotSection key={sectionData.datastreamName} sectionData={sectionData.plotTypes}/>
            </div>
          </div>
      ));
    }
    else{
      return <div className='list-view-div'></div>
    }
  }
}

class PlotSection extends React.Component {

  render() {

    return this.props.sectionData.map((rowData, i) => (
      <div key={rowData.plotType} className='plot-row'>
        <p className='plot-row-label'>{rowData.plotType}</p>
        <div key={rowData.plotType} className='plot-row-plots'>
          <PlotRow key={rowData.plotType} rowData={rowData.data}/>
        </div>
      </div>
    ));
  }
}

class PlotRow extends React.Component {
  constructor(props){
    super(props)
    this.state = { currentImage: 0, lightboxIsOpen: false };

    this.openLightbox  = this.openLightbox.bind(this);
    this.closeLightbox = this.closeLightbox.bind(this);
    this.thumbClick = this.thumbClick.bind(this)
    this.gotoNext = this.gotoNext.bind(this);
    this.gotoPrev = this.gotoPrev.bind(this);

  }

  openLightbox(e) {
    console.log('click',e.currentTarget.getAttribute('data-index'))
    this.setState({
      currentImage: parseInt(e.currentTarget.getAttribute('data-index')),
      lightboxIsOpen: true,
    }); 
  }

  closeLightbox() {
    this.setState({
      currentImage: 0,
      lightboxIsOpen: false,
    }); 
  }
  gotoPrev() {
    this.setState({
      currentImage: this.state.currentImage - 1,
    }); 
  }
  gotoNext() {
    console.log(this.state.currentImage + 1)
    this.setState({
      currentImage: this.state.currentImage + 1, 
    }); 
  }

  thumbClick(i) {
    this.setState({
      currentImage: i
    });
  }

  imgClick(e) {
    window.open(e.currentTarget.src);
  }

  render() {
    let images = []
    this.props.rowData.map((plotData, i) => (
      images.push({src: plotData.url, caption:plotData.date})
    ));
    return (
      <div>
        <Lightbox
          images={images}
          isOpen={this.state.lightboxIsOpen}
          onClickPrev={this.gotoPrev}
          onClickNext={this.gotoNext}
          currentImage={this.state.currentImage}
          onClose={this.closeLightbox}
          onClickThumbnail={this.thumbClick}
          onClickImage={this.imgClick}
          theme={customLightboxStyles}
          backdropClosesModal={true}
          showThumbnails={true}
          zoomable={true}
        />
        {this.props.rowData.map((plotData, i) => (
          <div key={plotData.date} className='plot'>
            <Plot onClick={this.openLightbox} index={i} key={plotData.date} plotData={plotData}/>
            <p className='plot-date'>{plotData.date}</p>
          </div>
        ))}
    </div>
    )
  }
}

class Plot extends React.Component {

  render() {
    return <img onClick={this.props.onClick} data-index={this.props.index} className='plot-img' src={this.props.plotData.url} />
  }
}


export default App;
