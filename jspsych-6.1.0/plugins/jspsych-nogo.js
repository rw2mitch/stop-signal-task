/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["nogo"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('nogo', 'stimulus', 'image');

  plugin.info = {
    name: 'nogo',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      SSD: {
      type: jsPsych.plugins.parameterType.INT,
      pretty_name: "Stop signal delay",
      default: 250,
      description: "Time between presentation of image stimulus and the stop signal"
      },
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
    }
  };

  plugin.trial = function(display_element, trial) {
    // display image stimulus
    var html = '<img src="' + trial.stimulus + '" id="jspsych-image-keyboard-response-stimulus" style="';
    if (trial.stimulus_height !== null) {
      html += 'height:' + trial.stimulus_height + 'px; '
      if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
        html += 'width: auto; ';
      }
    }
    if (trial.stimulus_width !== null) {
      html += 'width:' + trial.stimulus_width + 'px; '
      if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
        html += 'height: auto; ';
      }
    }
    html += '"></img>';

    console.log(pSSD + 0.1);
    trial.SSD = pSSD;
    console.log(pSSD + 0.2)

    // setup audio stimulus (copied from audio-keyboard-response plugin. Not sure how it works but it seems to be necessary)

    // add prompt
    if (trial.prompt !== null) {
      html += trial.prompt;
    }

    // render
    display_element.innerHTML = html;

    var SS_played = false;
    //var end_trial_delay = trial.SSD + 500;

    SS_finished = function() {
      SS_played = true;
    };

    play_SS = function() {
      audio_stimulus.play();
      setTimeout(function() {
        SS_finished();
      }, 500)
    };

    // play stop signal with delay that is defined in your html file
    setTimeout(function () {
      play_SS();
      }, trial.SSD);

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      SS_played = false;

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-image-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }
      // if response is given before the stop signal, end the trial after the stop signal has been played (SSD + 500 milliseconds)
      if (trial.response_ends_trial && SS_played) {
        end_trial();
        }
      else if (trial.response_ends_trial && SS_played === false) {
        setTimeout(function() {
          end_trial();
          }, trial.SSD + 500 - response.rt);

      }
      };

      //if (trial.response_ends_trial && SS_played)

        // start audio

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
