import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

const Buton =({onPress,children})=>{
    const{buttonStyle,textStyle}=styles;
    return(
        <TouchableOpacity onPress={onPress} style={buttonStyle}>
            <Text style={textStyle}> {children}</Text>
        </TouchableOpacity>
    );
};

const styles={
    textStyle:{
        alignSelf: 'center',
        color: '#f37121',
        fontSize: 16,
        fontWeight: '600',
        paddingTop:10,
        paddingBottom:10,

    },

    buttonStyle:{
        flex:1,
        alignSelf:'stretch',
        backgrounColor: '#008891',    
        borderRadius:5,
        borderWidth:1,
        borderColor:'#f37121',
        marginLeft:5,
        marginRight:5,
        marginBottom:5,
    },
      
};

export default Buton;