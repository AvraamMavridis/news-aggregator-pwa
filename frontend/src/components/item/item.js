import { h, Component } from 'preact';
import style from './style';

const colors = {
  'ENIKOS': '#be1522',
  'PRONEWS': '#e72b4b',
  'ΣΚΑΪ': '#0072a8',
  'ATHENS MAGAZINE': '#252525',
  'CAPITAL.GR': '#3c618b',
  'ΝΕWSIT': '#c32701',
  'NEWSBOMB': '#af1e23',
  'IN.GR': '#2C93CE',
  'ΠΡΩΤΟ ΘΕΜΑ': '#f27600',
  'HUFFINGTONPOST': '#058b7b'
}


export default class Item extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showDescription: false,
      item: {}
    };
    this.toggleDescription = () => this.setState({ showDescription: !this.state.showDescription });

    if (typeof window !== "undefined") {
        this.frag = window.document.createDocumentFragment();
        this.div = window.document.createElement('div');
    }

  }

  setItem(nextProps){
    if (typeof window !== "undefined") {
      const item = nextProps;
      this.div.innerHTML = item.description;
      this.frag.appendChild(this.div);
      const img = this.frag.querySelector('img');
      item.description = this.frag.textContent;
      if(img){
        item.img = { url: img.src };
      }
      this.setState({ item: item });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.isFetched;
  }

  componentWillReceiveProps(nextProps) {
    this.setItem(nextProps);
  }

  componentWillMount() {
    this.setItem(this.props);
  }


	render() {
    const itemClass = `cute-8-phone cute-2-phone-offset ${ style.item }`;
    if(!this.props.isFetched) return '';


    const { showDescription, item } = this.state;
    const { title, description, id, timeString, dateString } = item;
    let time = timeString.split(':')
    time = `${ time[0] }:${ time[1] }`;

    var date = new Date(dateString),
    locale = "el",
    month = date.toLocaleString(locale, { month: "short" }),
    weekday = date.toLocaleString(locale, { weekday: "long" });
    let datemonth = dateString.split('/')
    datemonth = `${ datemonth[0] }/${ datemonth[1] }`

		return (
			<div className={ itemClass } style={ { borderLeft: `15px solid ${colors[item.source]}`}}>
        <div className={ `cute-2-phone ${ style.time }` } >
          <div className={ style.weekday }>{ weekday } { datemonth } { time }</div>
          <div className={ style.source }>{ item.source }</div>
        </div>
        <div className="cute-10-phone" style={{ paddingRight: 0, paddingBottom: 0, }}>
        <div className={ ` ${ style.title }` }>
          { title }
        </div>
        <div className={ `${ style.moreContainer }` }>
          <div onClick={ this.toggleDescription }>ΠΕΡΙΛΗΨΗ
            <span className={ `${style.desc} ${style.icon} ${ showDescription ? style.rotate : '' }` }></span>
          </div>
          <div>
            <a target="_blank" href={ item.link }>ΑΝΟΙΞΕ ΑΡΘΡΟ</a>
            <span className={ `${style.open} ${style.icon} }` }></span>
          </div>
        </div>
        </div>
        {
          showDescription ? <div className="cute-12-phone"><p className={ style.description } dangerouslySetInnerHTML={{__html: description}}></p></div> : ''
        }
			</div>
		);
	}
}
