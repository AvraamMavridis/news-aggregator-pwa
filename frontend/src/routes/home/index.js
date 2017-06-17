import { h, Component } from "preact";
import style from "./style";
import Item from "../../components/item/item";
import store from "store";
import config from '../../config';

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
      items: Array.apply(null, { length: 100 }).map(i => ({ id: i }))
    };
		this.onRefresh = this.onRefresh.bind(this);
  }

  /**
   * Handle refresh click
   *
   * @memberof Home
   */
  async onRefresh() {
		this.setState({ isFetched: false }, () => {
			const response = await fetch(config.endPoint);
      let items = await response.json();
			items = items.filter(item => Boolean(item.source))
			items = items.sort((a, b) => b.createdAt - a.createdAt);
			const newItems = items;
			store.set("items", items);
			this.setState({ items: newItems, isFetched: true, newItems });
		})
  }

  componentWillMount() {
    const items = store.get("items");
    if (!items) {
      this.onRefresh();
    } else {
      this.setState({ items, isFetched: true, newItems: items });
    }
  }

  onSearch(e){
    console.log(e, this.search.value)

    const items = this.state.newItems.filter(item => item.title.includes(this.search.value));
    this.setState({
      items
    })
  }

  render() {
    const { items, isFetched } = this.state;
		const refreshClass = `cute-8-phone cute-2-phone-offset ${ style.message }`

    return (
      <div class={style.refreshview}>
          <input type="text" onKeyPress={ e => this.onSearch(e) } ref={(search) => (this.search = search) } />
          <div class={refreshClass}>
						{ isFetched ? <div>
								<div className="button" role="button" onClick={ this.onRefresh }>
									<span class={ style.refreshButton }></span>
									<span>Refresh</span>
								</div>
							</div>
							: <div class="loader">Loading...</div>}
					</div>
          <div class={style.home}>
            {items.map((item, i) => (
              <Item key={i} {...item} isFetched={isFetched} />
            ))}
          </div>
      </div>
    );
  }
}
