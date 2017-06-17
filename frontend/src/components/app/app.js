import { h, Component } from 'preact';
import { Router } from 'preact-router';
import Header from '../header/header';
import Home from '../../routes/home';

/**
 * App Component
 *
 * @export
 * @class App
 * @extends {Component}
 */
export default class App extends Component {
	/** Gets fired when the route changes.
	 *
	 *	@param {DOM.Event} event
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	/**
	 * Render Root of application
	 *
	 * @returns {JSX.Element}
	 *
	 * @memberof App
	 */
	render() {
		return (
			<div id="app">
				<Header />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
				</Router>
			</div>
		);
	}
}
