//  alexa SKD 2.0 SAMPLE
const Alexa = require('ask-sdk');
let skill;

// lamda handler
exports.hander = async function(event,context){
    if(!skill){
        skill = Alexa.SkillBuilders.custom()
        // 利用するハンドラを定義する
        .addRequestHandlers(
            LaunchRequestHandler,
            OrderIntentHandler
        )
        .create();
    }
    return skill.invoke(event);
}

const LaunchRequestHandler = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput){
        return handlerInput.responseBuilder
        .speak("ようこそ、コヒーやさんに")
        .reprompt("ご注文をお伺いします")
        .getResponse();
    }
}

const OrderIntentHandler = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
        && handlerInput.requestEnvelope.request.intent.name  === "OrderIntent";
    },
    handle(handlerInput){
        return handlerInput.responseBuilder
        .speak("ご利用ありがとうございました")
        .getResponse();
    }

}

const MyHander = {
    canHandle(handerInput){
        // 入力ハンドラ戻り値で動作を判定する
        return true;
    },
    handle(handerInput){
        return handlerInputr.esponseBuilder
        .speak("こんにちは")
        .getResponse();
    }

}