import {isArray, each, include, without, any} from "lodash";
import { state } from "./state";
import postal from "postal";

const filters = {
	"in": {}, // jscs:ignore disallowQuotedKeysInObjects
	out: {}
};

export default filters;

export function addFilter( _filters ) {
	_filters = isArray( _filters ) ? _filters : [ _filters ];
	each( _filters, function( filter ) {
		filter.direction = filter.direction || state._config.filterDirection;
		each( ( filter.direction === "both" ) ? [ "in", "out" ] : [ filter.direction ], function( dir ) {
			if ( !filters[ dir ][ filter.channel ] ) {
				filters[ dir ][ filter.channel ] = [ filter.topic ];
			} else if ( !( include( filters[ dir ][ filter.channel ], filter.topic ) ) ) {
				filters[ dir ][ filter.channel ].push( filter.topic );
			}
		} );
	} );
}

export function removeFilter( _filters ) {
	_filters = isArray( _filters ) ? _filters : [ _filters ];
	each( _filters, function( filter ) {
		filter.direction = filter.direction || state._config.filterDirection;
		each( ( filter.direction === "both" ) ? [ "in", "out" ] : [ filter.direction ], function( dir ) {
			if ( filters[ dir ][ filter.channel ] && include( filters[ dir ][ filter.channel ], filter.topic ) ) {
				filters[ dir ][ filter.channel ] = without( filters[ dir ][ filter.channel ], filter.topic );
			}
		} );
	} );
}

export function matchesFilter( channel, topic, direction ) {
	const channelPresent = Object.prototype.hasOwnProperty.call( filters[direction], channel );
	const topicMatch = ( channelPresent && any( filters[ direction ][ channel ], function( binding ) {
		return postal.configuration.resolver.compare( binding, topic );
	} ) );
	const blacklisting = state._config.filterMode === "blacklist";
	return state._config.enabled && ( ( blacklisting && ( !channelPresent || ( channelPresent && !topicMatch ) ) ) || ( !blacklisting && channelPresent && topicMatch ) );
}
