import { h, Component } from 'preact';
import style from './style';
import store from 'store';
import config from '../../config';

/**
 * Item Component
 *
 * @export
 * @class Item
 * @extends {Component}
 */
export default class Item extends Component {
	/**
	 * Creates an instance of Item.
	 * @param {any} props
	 *
	 * @memberof Item
	 */
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

	/**
	 * In case of rss feed we can extract some description
	 * Unfortunately some website have it mixed with html elements
	 * So we need to append to a virtual fragment
	 *
	 * @param {any} nextProps
 	 * @param {boolean} nextProps.showDescription - Display description flag
   * @param {object} nextProps.item - News' item
	 *
	 * @memberof Item
	 */
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

	/**
	 * Save Item to Localstorage
	 *
	 * @param {any} item
	 * @param {string} item.title
	 * @param {string} item.description
	 * @param {string} item.source - Article url
	 * @param {string} item.createdAt - Timestamp
	 *
	 * @memberof Item
	 */
	saveItem(item) {
		const saved = store.get('saved') || [];
		saved.push(item);
		store.set('saved', saved);
	}

	/**
	 * Update only if fetched
	 *
	 * @param {any} nextProps
	 * @param {any} nextState
	 * @returns {boolean}
	 *
	 * @memberof Item
	 */
	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.isFetched;
	}

	/**
	 * Update item on new props
	 *
	 * @param {any} nextProps
	 *
	 * @memberof Item
	 */
	componentWillReceiveProps(nextProps) {
		this.setItem(nextProps);
	}

	/**
	 * Set item on mounting
	 *
	 * @memberof Item
	 */
	componentWillMount() {
		this.setItem(this.props);
	}

	/**
	 * Render Item
	 *
	 * @returns {JSX.Element}
	 *
	 * @memberof Item
	 */
	render() {
		if (!this.props.isFetched) return '';
		const itemClass = `cute-8-phone cute-2-phone-offset ${style.item}`;

		const { showDescription, item } = this.state;
		const { title, description, id, timeString, dateString, createdAt } = item;

		let styleSource = item.source.replace('.', '');
		styleSource = styleSource.replace(' ', '');

		const when = new Date(createdAt).toLocaleDateString('el-EL', config.dateFormat);

		return (
			<div className={itemClass} style={{ borderLeft: `15px solid ${config.sourceColors[item.source]}` }}>
				<div className={`cute-2-phone ${style.source} ${style[styleSource]}`} />
				<div className={`cute-10-phone ${style.titleContainer}`}>
					<div className={`cute-12-phone ${style.title}`}>
						{title}
					</div>
					<div className={`cute-12-phone ${style.time}`}>
						<span className={style.calendarIcon} />{when}
					</div>
				</div>
				<div className={`cute-12-phone ${style.buttonContainer}`}>
					<div className={`${style.moreContainer}`}>
						<button
							className={`${style.button}`}
							disabled={description === 'undefined'}
							onClick={this.toggleDescription}
						>
							ΠΕΡΙΛΗΨΗ<span
								className={`${style.desc} ${showDescription ? style.rotate : ''} ${description ===
									'undefined'
									? style.disabledIcon
									: ''}`}
							/>
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
