import { h, Component } from "preact";
import style from "./style";
import Item from "../../components/item/item";
import store from "store";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetched: false,
      items: Array.apply(null, { length: 100 }).map(i => ({ id: i }))
    };
		this.handleRefresh = this.handleRefresh.bind(this);
  }

  handleRefresh() {
		this.setState({ isFetched: false }, () => {
			fetch("https://hn8r2gj6e6.execute-api.eu-west-1.amazonaws.com/dev/list")
				.then(response => response.json())
				.then(items => {
					items = items.filter(item => Boolean(item.source))
					items = items.sort((a, b) => b.createdAt - a.createdAt);
					const newItems = items;
					store.set("items", items);
					this.setState({ items: newItems, isFetched: true, newItems });
				})
				.catch(console.log)
		})
  }

  componentWillMount() {
    const items = store.get("items");
    if (!items) {
      this.handleRefresh();
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
								<div className="button" role="button" onClick={ this.handleRefresh }>
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
