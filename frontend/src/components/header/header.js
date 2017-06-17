import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';

/**
 * Header Component
 *
 * @export
 * @class Header
 * @extends {Component}
 */
export default class Header extends Component {
	/**
	 * Render Header
	 *
	 * @returns {JSX.Element}
	 *
	 * @memberof Header
	 */
	render() {
		return (
			<header class={style.header}>
				<h1>ΝΕΑ</h1>
				<nav>
					<Link activeClassName={style.active} href="/">Home</Link>
				</nav>
			</header>
		);
	}
}
