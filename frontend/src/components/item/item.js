import { h, Component } from 'preact';
import style from './style';
import store from 'store';

const colors = {
	ENIKOS: '#be1522',
	PRONEWS: '#e72b4b',
	ΣΚΑΪ: '#0072a8',
	'ATHENS MAGAZINE': '#252525',
	'CAPITAL.GR': '#3c618b',
	ΝΕWSIT: '#c32701',
	NEWSBOMB: '#af1e23',
	'IN.GR': '#2C93CE',
	'ΠΡΩΤΟ ΘΕΜΑ': '#f27600',
	HUFFINGTONPOST: '#058b7b',
	Lifo: '#D72222',
	CNNgreece: '#CC0000',
	'ΑΠΕ-ΜΠΕ': '#231F20',
	'ΤΑ ΝΕΑ': '#3B6DA4',
	Protagon: '#000000',
	ThePressProject: '#014B69',
	'DOC TV': '#1EBDDC',
};

export default class Item extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showDescription: false,
			item: {},
		};
		this.toggleDescription = () => this.setState({ showDescription: !this.state.showDescription });

		if (typeof window !== 'undefined') {
			this.frag = window.document.createDocumentFragment();
			this.div = window.document.createElement('div');
		}
	}

	setItem(nextProps) {
		if (typeof window !== 'undefined') {
			const item = nextProps;
			this.div.innerHTML = item.description;
			this.frag.appendChild(this.div);
			const img = this.frag.querySelector('img');
			item.description = this.frag.textContent;
			if (img) {
				item.img = { url: img.src };
			}
			this.setState({ item: item });
		}
	}

	saveItem(item){
		const saved = store.get('saved') || [];
		saved.push(item);
		store.set('saved', saved);
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
		const itemClass = `cute-8-phone cute-2-phone-offset ${style.item}`;
		if (!this.props.isFetched) return '';

		const { showDescription, item } = this.state;
		const { title, description, id, timeString, dateString, createdAt } = item;
		let time = timeString.split(':');
		time = `${time[0]}:${time[1]}`;

		var date = new Date(dateString),
			locale = 'el',
			month = date.toLocaleString(locale, { month: 'short' }),
			weekday = date.toLocaleString(locale, { weekday: 'long' });
		let datemonth = dateString.split('/');
		datemonth = `${datemonth[0]}/${datemonth[1]}`;

		let styleSource = item.source.replace('.', '');
		styleSource = styleSource.replace(' ', '');
    const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', };
    const when = new Date(createdAt).toLocaleDateString('el-EL', options);

		return (
			<div className={itemClass} style={{ borderLeft: `15px solid ${colors[item.source]}` }}>
				<div className={`cute-2-phone ${style.source} ${style[styleSource]}`} />
				<div className={ `cute-10-phone ${style.titleContainer}` }>
					<div className={`cute-12-phone ${style.title}`}>
						{title}
					</div>
					<div className={`cute-12-phone ${style.time}`}>
						<span className={style.calendarIcon}></span>{when}
					</div>
				</div>
				<div className={`cute-12-phone ${style.buttonContainer}`}>
					<div className={`${style.moreContainer}`}>
						<button
							className={`${style.button}`}
							disabled={description === 'undefined'}
							onClick={this.toggleDescription}
						>
							ΠΕΡΙΛΗΨΗ<span className={`${style.desc} ${showDescription ? style.rotate : ''} ${ description === 'undefined' ? style.disabledIcon : '' }`} />
						</button>
						<button
							className={`${style.button}`}
							disabled={description === 'undefined'}
							onClick={this.saveItem}
						>
							ΑΠΟΘΗΚΕΥΣΗ<span className={`${style.save}`} />
						</button>
						<div>
							<a target="_blank" href={item.link}>ΑΝΟΙΞΕ ΑΡΘΡΟ</a>
							<span className={`${style.open} ${style.icon} }`} />
						</div>
					</div>
				</div>
				{showDescription
					? <p
							className={`cute-12-phone ${style.description}`}
							dangerouslySetInnerHTML={{ __html: description }}
						/>
					: ''}
			</div>
		);
	}
}
