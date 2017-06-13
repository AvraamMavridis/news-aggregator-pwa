import { h, Component } from 'preact';
import style from './style';
import store from 'store';
import Item from '../../components/item/item';

export default class Saved extends Component {
	state = {
		saved: [],
	};

	onSaveToggle = (isSaved) =>{
		const saved = store.get('saved') || [];
		this.setState({ saved });
	}

	componentWillMount() {
		const saved = store.get('saved');
		this.setState({ saved });
	}

	render(props, { saved }) {
		saved = saved.sort((a, b) => b.createdAt - a.createdAt);
		return (
				<div class={style.view}>
					{saved.map((item, i) =>
						<Item onSaveToggle={this.onSaveToggle} key={item.id} {...item} isFetched={true} />
					)}
				</div>
		);
	}
}
