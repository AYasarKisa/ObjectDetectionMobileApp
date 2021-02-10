import React, { Children } from 'react';
import {Text, View} from 'react-native';

const Header = ({children})=> {
    const {textStyle,viewStyle}=styles;
    return(
        <View style={viewStyle}>
        
            <Text style={textStyle}>{children}</Text>


        </View>
    );

};


const styles={
    textStyle:{
        fontSize:20,
        color:'#e7e7de'
    },
    viewStyle:{
        backgroundColor: '#008891',
        height:60,
        justifyContent:'center',//dikey duzlemde
        alignItems:'center',//yatay duzlemde
        marginTop:15,
        shadowOffset:{width: 0,height:2},
        shadowOpacity:0.5,


       
        
        


    }
};

export default Header;