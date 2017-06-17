import { h, Component } from 'preact';
import style from './style';
import Item from '../../components/item/item';
import store from 'store';
import config from '../../config';
import debounce from 'lodash/debounce';

/**
 * Home Component
 *
 * @export
 * @class Home
 * @extends {Component}
 */
export default class Home extends Component {
	/**
   * Creates an instance of Home.
   * @param {any} props
   *
   * @memberof Home
   */
	constructor(props) {
		super(props);
		this.state = {
			isFetched: false,
			items: Array.apply(null, { length: 100 }).map(i => ({ id: i })),
		};
		this.onRefresh = this.onRefresh.bind(this);
    this.onSearch = debounce(() => {
      console.log('DEBOUNCED')
      const items = this.state.newItems.filter(item => item.title.includes(this.search.value));
      this.setState({
        items,
      });
    }, 1000);
	}

	/**
   * Handle refresh click
   *
   * @memberof Home
   */
	onRefresh() {
		this.setState({ isFetched: false }, () => {
			fetch(config.endPoint).then(response => response.json()).then(items => {
				items = items.filter(item => Boolean(item.source));
				items = items.sort((a, b) => b.createdAt - a.createdAt);
				const newItems = items;
				store.set('items', items);
				this.setState({ items: newItems, isFetched: true, newItems });
			});
		});
	}

	/**
   * Get items from locastorage, if there aren't items
   * attempt a fetch
   *
   * @memberof Home
   */
  componentWillMount() {
		const items = store.get('items');
		if (!items) {
			this.onRefresh();
		} else {
			this.setState({ items, isFetched: true, newItems: items });
		}
	}

	/**
   * Render home path
   *
   * @returns {JSX.Element}
   *
   * @memberof Home
   */
	render() {
		const { items, isFetched } = this.state;
		const refreshClass = `cute-8-phone cute-2-phone-offset ${style.message}`;

		return (
			<div className={style.refreshview}>
				<div className={refreshClass}>
					{isFetched
						? <div className={ style.inputsContainer }>
								<div className="button" role="button" onClick={this.onRefresh}>
									<span className={style.refreshButton} />
									<span>Refresh</span>
								</div>
                <input type="text" onKeyDown={this.onSearch} ref={search => (this.search = search)} />
							</div>
						: <div className="loader">Loading...</div>}
				</div>
				<div className={style.home}>
					{items.map((item, i) => <Item key={i} {...item} isFetched={isFetched} />)}
				</div>
			</div>
		);
	}
}
