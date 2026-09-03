'use strict';
// .. Supported output audio formats (FFmpeg)

const FORMATS = [
  ['MP3', 'mp3', 'audio'],
  ['AAC', 'aac', 'audio'],
  ['WAV', 'wav', 'audio'],
  ['FLAC', 'flac', 'audio'],
  ['OGG', 'ogg', 'audio'],
  ['OPUS', 'opus', 'audio'],
  ['M4A', 'm4a', 'audio'],
  ['WMA', 'wma', 'audio'],
  ['AC3', 'ac3', 'audio'],
  ['EAC3', 'eac3', 'audio'],
  ['DTS', 'dts', 'audio'],
  ['TRUEHD', 'truehd', 'audio'],
  ['WV', 'wv', 'audio'],
  ['AIFF', 'aiff', 'audio'],
  ['TTA', 'tta', 'audio'],
  ['AMR', 'amr', 'audio'],
  ['OGA', 'oga', 'audio'],
  ['SPX', 'spx', 'audio'],
  ['CAF', 'caf', 'audio'],
  ['VOC', 'voc', 'audio'],
  ['S16LE', 's16le', 'audio'],
  ['S16BE', 's16be', 'audio'],
  ['S32LE', 's32le', 'audio'],
  ['S32BE', 's32be', 'audio'],
  ['F32LE', 'f32le', 'audio'],
  ['F64LE', 'f64le', 'audio'],
  ['U8', 'u8', 'audio'],
  ['ALAW', 'alaw', 'audio'],
  ['MULAW', 'mulaw', 'audio']
];

module.exports = { FORMATS };
