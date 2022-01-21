import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import {
    Dimensions,
    FlatList,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import shallowEqual from 'shallowequal';
import LayoutProvider, { getLayout } from 'react-native-layout-provider';
import styles from "./styles";

export { getLayout }


const ModeButtonItem = ({ mode, modeData, selected:selectedMode, callback }) => {
  let selected = selectedMode === mode ? styles.selectedButton : {};
  console.log(`rendering ${JSON.stringify(mode)}`);
  return (
    <TouchableOpacity
      style={{
        height: "100%",
      }}
      onPress={ ()=> callback(mode) }>
      <Text style={ [ styles.button, selected ] }>{ `${modeData.label}` }</Text>
    </TouchableOpacity>
  );
}

export default class LayoutTester extends Component {

    static displayName = "LayoutTester";

    static propTypes = {
        children: PropTypes.node,
        config: PropTypes.object,
        noTestWrapConfig: PropTypes.shape({
            mode: PropTypes.string.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
            exportScaling: PropTypes.string.isRequired,
            portrait: PropTypes.bool,
        }),
        viewportChanged: PropTypes.func
    };

    static defaultProps = {
        config: {
            iphone12Max: {
                label: "13 Pro Max, 12 Pro Max",
                width: 428,
                height: 926,
                exportScaling: "@3x",
            },
            iphone12: {
                label: "13, 13 Pro, 12, 12 Pro",
                width: 390,
                height: 844,
                exportScaling: "@3x",
            },
            iphone12mini: {
                label: "13 Mini, 12 Mini",
                width: 360,
                height: 780,
                exportScaling: "@3x",
            },
            iphoneXSMax: {
                label: "11 Pro Max, XS Max",
                width: 414,
                height: 896,
                exportScaling: "@3x",
            },
            iphoneXS: {
                label: "11 Pro, X, XS",
                width: 375,
                height: 812,
                exportScaling: "@3x",
            },
            iphoneXR: {
                label: "11, XR",
                width: 414,
                height: 896,
                exportScaling: "@2x",
            },
            iphone6plus: {
                label: "6+, 6S+, 7+, 8+",
                width: 414,
                height: 736,
                exportScaling: "@3x*",
            },
            iphone6: {
                label: "6, 6s, 7, 8",
                width: 375,
                height: 667,
                exportScaling: "@2x",
            },
            iphone5: {
                label: "5, 5s, 5c, SE",
                width: 320,
                height: 568,
                exportScaling: "@2x",
            },
            iphone4: {
                label: "4, 4s",
                width: 320,
                height: 480,
                exportScaling: "@2x",
            },
            iphone3: {
                label: "1, 2, 3",
                width: 320,
                height: 480,
                exportScaling: "@1x",
            },
        }
    };

    constructor(props) {
        super(props);
        if (props.noTestWrapConfig) {
            let deviceDimensions = Dimensions.get("window");
            let { mode, width, height, portrait, exportScaling } = props.noTestWrapConfig;
            if (!mode) mode = 'default';
            if (!width) width = deviceDimensions.width;
            if (!height) height = deviceDimensions.height;
            if (!exportScaling) exportScaling = deviceDimensions.exportScaling;
            portrait = width <= height;
            this.state = {
                mode,
                viewport: { width, height, exportScaling},
                portrait: portrait
            };
        } else {
            this.state = { portrait: true };
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (shallowEqual(this.props.noTestWrapConfig, nextProps.noTestWrapConfig)) return;

        if (!nextProps.noTestWrapConfig) {
            let config = this.props.config;
            let mode = Object.keys(config)[0];
            this.setDefaultConfig(mode, config[mode]);
            return;
        }

        let { mode, width, height, portrait, exportScaling } = nextProps.noTestWrapConfig;
        this.setDefaultConfig(mode, {
            width,
            height,
            portrait,
            exportScaling,
        });
    }

    UNSAFE_componentWillMount() {
        if (this.props.noTestWrapConfig) return;

        let config = this.props.config;
        let mode = Object.keys(config)[0];
        this.setDefaultConfig(mode, config[mode]);
    }

    setDefaultConfig(mode, config) {
        let newState = {
            mode: mode,
            viewport: {
                height: config.height,
                width: config.width,
                exportScaling: config.exportScaling,
            },
            portrait: config.portrait || this.state.portrait
        };
        this.setState(newState);
    }

    handleSelection(mode, portrait) {
        if (this.state.mode === mode && this.state.portrait === portrait) {
            return;
        }
        let { height, width, exportScaling } = this.props.config[mode];
        let viewport = portrait ? { height, width, exportScaling } : { height: width, width: height, exportScaling };
        let newState = {
            mode,
            viewport,
            portrait,
        };
        this.setState(newState, () => {
            if (this.props.viewportChanged) {
                this.props.viewportChanged(newState);
            }
        });
    }

    handleRotate() {
        this.handleSelection(this.state.mode, !this.state.portrait);
    }

    renderLayoutTester() {
        let { viewport } = this.state;
        return (
            <View style={ [ styles.container ] }>
                <FlatList
                  testID="mode-buttons"
                  horizontal
                  style={{
                    height: 120,
                    width: "100%",
                  }}
                  data={Object.keys(this.props.config)}
                  renderItem={({item}) => { return (
                      <ModeButtonItem
                        mode={item}
                        modeData={this.props.config[item]}
                        selected={this.state.mode}
                        callback={
                          (mode) => this.handleSelection(mode, this.state.portrait)
                        }
                      />
                    );
                  }}
                  keyExtractor={(item) => item.label}
                />
                <View style={ styles.body }>
                    <View style={ [ styles.viewport, viewport ] }>
                        { this.props.children }
                    </View>
                    <Text style={ styles.subTitle }>{ `(${viewport.width}x${viewport.height}) ${viewport.exportScaling}` }</Text>
                </View>
                <View style={ styles.buttons }>
                    <TouchableOpacity onPress={ () => this.handleRotate() }>
                        <Text style={ styles.button }>Rotate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {
        let children;
        if (this.props.noTestWrapConfig) {
            children = this.props.children;
        } else {
            children = this.renderLayoutTester();
        }
        return (
            <LayoutProvider
                label={ this.state.mode }
                width={ this.state.viewport.width }
                height={ this.state.viewport.height }
                portrait={this.state.portrait }
            >
                { children }
            </LayoutProvider>
        );
    }
}
