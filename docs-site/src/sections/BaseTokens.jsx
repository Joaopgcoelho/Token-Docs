import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

/* ═══════════════════════════════════════════════
   SIZING DATA
   ═══════════════════════════════════════════════ */

const BORDER_RADIUS = [
  ['0', '0'], ['100', '1'], ['200', '2'], ['300', '4'], ['400', '8'], ['500', '12'],
  ['600', '16'], ['700', '20'], ['800', '24'], ['900', '28'], ['1000', '32'], ['pill', '200'],
];
const BORDER_WIDTH = [
  ['0', '0'], ['100', '1'], ['200', '2'], ['300', '4'], ['400', '6'],
];
const FONT_SIZE = [
  ['50', '8'], ['100', '10'], ['200', '12'], ['300', '14'], ['400', '16'], ['500', '18'],
  ['600', '20'], ['700', '22'], ['800', '24'], ['900', '26'], ['1000', '28'], ['1100', '30'],
  ['1200', '32'], ['1300', '34'], ['1400', '36'], ['1500', '38'], ['1600', '40'], ['1700', '42'],
  ['1800', '44'], ['1900', '46'], ['2000', '48'], ['2100', '50'], ['2200', '52'], ['2300', '56'],
  ['2400', '60'], ['2500', '64'], ['2600', '72'], ['2700', '80'], ['2800', '160'],
];
const FONT_WEIGHT = [
  ['100', 'Thin'], ['200', 'Extra Light'], ['300', 'Light'], ['400', 'Regular'],
  ['500', 'Medium'], ['600', 'SemiBold'], ['700', 'Bold'], ['800', 'Extra Bold'], ['900', 'Black'],
];
const LINE_HEIGHT = [
  ['50', '8'], ['100', '10'], ['200', '12'], ['300', '14'], ['400', '16'], ['500', '18'],
  ['600', '20'], ['700', '22'], ['800', '24'], ['900', '26'], ['1000', '28'], ['1100', '30'],
  ['1200', '32'], ['1300', '34'], ['1400', '36'], ['1500', '38'], ['1600', '40'], ['1700', '42'],
  ['1800', '44'], ['1900', '46'], ['2000', '48'], ['2100', '50'], ['2200', '52'], ['2300', '58'],
  ['2400', '64'], ['2500', '72'], ['2600', '112'], ['2700', '140'], ['2800', '160'],
];
const PARAGRAPH_SPACING = [['100', '16'], ['200', '20']];
const SPACING = [
  ['0', '0'], ['25', '2'], ['50', '4'], ['75', '6'], ['100', '8'], ['125', '10'],
  ['150', '12'], ['175', '14'], ['200', '16'], ['225', '18'], ['250', '20'], ['275', '22'],
  ['300', '24'], ['350', '28'], ['400', '32'], ['450', '40'], ['500', '48'], ['600', '56'],
  ['700', '64'], ['800', '72'], ['900', '80'], ['1000', '96'], ['1100', '112'], ['1200', '128'],
  ['1300', '144'], ['1400', '160'], ['1500', '192'], ['1600', '224'], ['1700', '256'],
  ['1800', '288'], ['1900', '320'],
];
const OPACITY = [
  ['5', '5%'], ['10', '10%'], ['15', '15%'], ['20', '20%'], ['25', '25%'], ['30', '30%'],
  ['40', '40%'], ['50', '50%'], ['60', '60%'], ['70', '70%'], ['80', '80%'], ['90', '90%'], ['100', '100%'],
];
const BREAKPOINT = [['xs', '0'], ['sm', '490'], ['md', '768'], ['lg', '1040'], ['xl', '1440']];
const ZINDEX = [
  ['0', '0'], ['100', '100'], ['200', '200'], ['300', '300'], ['400', '400'], ['500', '500'],
  ['600', '600'], ['700', '700'], ['800', '800'], ['900', '900'], ['1000', '1000'],
  ['1010', '1010'], ['1020', '1020'], ['1030', '1030'], ['1040', '1040'], ['1050', '1050'],
  ['1060', '1060'], ['1070', '1070'], ['1080', '1080'],
];
const MOTION_DURATION = [
  ['0', '0ms'], ['50', '50ms'], ['100', '100ms'], ['150', '150ms'], ['200', '200ms'],
  ['250', '250ms'], ['300', '300ms'], ['350', '350ms'], ['400', '400ms'], ['450', '450ms'],
  ['500', '500ms'], ['1000', '1000ms'], ['1500', '1500ms'], ['5000', '5000ms'],
];
const MOTION_MOVEMENT = [
  ['linear', 'cubic-bezier(0, 0, 1, 1)'],
  ['ease-in-out', 'cubic-bezier(0.42, 0, 0.58, 1)'],
  ['ease-out', 'cubic-bezier(0.19, 0.91, 0.38, 1)'],
  ['ease-in', 'cubic-bezier(0.42, 0, 1, 1)'],
  ['ease', 'cubic-bezier(0.42, 0, 1, 1)'],
];
const SHADOW_OFFSET = [
  ['0', '0'], ['25', '1'], ['50', '2'], ['100', '4'], ['200', '8'], ['300', '12'],
  ['400', '16'], ['500', '20'], ['600', '24'], ['700', '28'], ['800', '32'], ['900', '36'],
  ['1000', '40'], ['1100', '44'], ['1200', '48'], ['1300', '52'], ['1400', '56'], ['1500', '60'], ['1600', '64'],
];
const SHADOW_BLUR = [
  ['0', '0'], ['25', '1'], ['50', '2'], ['100', '4'], ['200', '8'], ['300', '12'],
  ['400', '16'], ['500', '20'], ['600', '24'], ['700', '28'], ['800', '32'], ['900', '36'],
  ['1000', '40'], ['1100', '44'], ['1200', '48'], ['1300', '52'], ['1400', '56'], ['1500', '60'], ['1600', '64'],
];

/* ═══════════════════════════════════════════════
   COLOR PALETTES DATA
   ═══════════════════════════════════════════════ */
const COLOR_FAMILIES = [
  { family: 'Neutrals', palettes: [
    { name: 'gray-light', colors: [
      { name: '0', hex: '#FFFFFF' }, { name: '100', hex: '#FAFAFA' }, { name: '200', hex: '#F5F5F5' },
      { name: '300', hex: '#E5E5E5' }, { name: '400', hex: '#DADADA' }, { name: '500', hex: '#A3A3A3' },
      { name: '600', hex: '#757575' }, { name: '700', hex: '#525252' }, { name: '800', hex: '#404040' },
      { name: '900', hex: '#262626' }, { name: '1000', hex: '#171717' }, { name: '1100', hex: '#0A0A0A' },
    ], alpha: [
      { name: '10A', hex: '#444444', opacity: '5%' }, { name: '100A', hex: '#444444', opacity: '10%' }, { name: '200A', hex: '#444444', opacity: '15%' },
      { name: '300A', hex: '#444444', opacity: '30%' }, { name: '400A', hex: '#444444', opacity: '50%' }, { name: '500A', hex: '#444444', opacity: '50%' },
    ] },
    { name: 'gray-dark', colors: [
      { name: '0', hex: '#000000' }, { name: '100', hex: '#0A0A0A' }, { name: '200', hex: '#171717' },
      { name: '300', hex: '#262626' }, { name: '400', hex: '#373737' }, { name: '500', hex: '#525252' },
      { name: '600', hex: '#8A8A8A' }, { name: '700', hex: '#A3A3A3' }, { name: '800', hex: '#D4D4D4' },
      { name: '900', hex: '#E5E5E5' }, { name: '1000', hex: '#F5F5F5' }, { name: '1100', hex: '#FAFAFA' },
    ], alpha: [
      { name: '10A', hex: '#A6A6A6', opacity: '5%' }, { name: '100A', hex: '#A6A6A6', opacity: '10%' }, { name: '200A', hex: '#A6A6A6', opacity: '15%' },
      { name: '300A', hex: '#A6A6A6', opacity: '30%' }, { name: '400A', hex: '#A6A6A6', opacity: '50%' }, { name: '500A', hex: '#A6A6A6', opacity: '50%' },
    ] },
    { name: 'stone', colors: [
      { name: '50', hex: '#F2F5F5' }, { name: '100', hex: '#DFE5E7' }, { name: '200', hex: '#CDD6D8' },
      { name: '300', hex: '#B9C6C9' }, { name: '400', hex: '#A7B6BB' }, { name: '500', hex: '#9AACB1' },
      { name: '600', hex: '#87969B' }, { name: '700', hex: '#6A777A' }, { name: '800', hex: '#4D5659' },
      { name: '900', hex: '#303637' }, { name: '1000', hex: '#131616' },
    ] },
    { name: 'zinc', colors: [
      { name: '50', hex: '#FDFCFA' }, { name: '100', hex: '#FBF7F3' }, { name: '200', hex: '#F9F2EC' },
      { name: '300', hex: '#F6EDE5' }, { name: '400', hex: '#F4E8DE' }, { name: '500', hex: '#F2E5D9' },
      { name: '600', hex: '#D4C8BE' }, { name: '700', hex: '#A79E96' }, { name: '800', hex: '#79736D' },
      { name: '900', hex: '#4C4844' }, { name: '1000', hex: '#3F352F' },
    ] },
    { name: 'pearl', colors: [
      { name: '50', hex: '#FBF6F3' }, { name: '100', hex: '#F4E9E2' }, { name: '200', hex: '#EEDDD0' },
      { name: '300', hex: '#E7CFBE' }, { name: '400', hex: '#E0C3AD' }, { name: '500', hex: '#DCBAA1' },
      { name: '600', hex: '#C0A38D' }, { name: '700', hex: '#98806F' }, { name: '800', hex: '#6E5D51' },
      { name: '900', hex: '#453A32' }, { name: '1000', hex: '#1C1714' },
    ] },
  ] },
  { family: 'Reds & Oranges', palettes: [
    { name: 'red', colors: [
      { name: '50', hex: '#FBE5E5' }, { name: '100', hex: '#F5BEBD' }, { name: '200', hex: '#F09896' },
      { name: '300', hex: '#EA706E' }, { name: '400', hex: '#E44A47' }, { name: '500', hex: '#E0302D' },
      { name: '600', hex: '#C42A27' }, { name: '700', hex: '#9B211F' }, { name: '800', hex: '#701817' },
      { name: '900', hex: '#460F0E' }, { name: '1000', hex: '#1C0606' },
    ] },
    { name: 'orange', colors: [
      { name: '50', hex: '#F9E3DF' }, { name: '100', hex: '#F0BAAF' }, { name: '200', hex: '#E79180' },
      { name: '300', hex: '#DE674F' }, { name: '400', hex: '#D53E20' }, { name: '500', hex: '#CF2300' },
      { name: '600', hex: '#B51E00' }, { name: '700', hex: '#8F1800' }, { name: '800', hex: '#681100' },
      { name: '900', hex: '#410B00' }, { name: '1000', hex: '#1A0400' },
    ] },
    { name: 'honey', colors: [
      { name: '50', hex: '#F9E6DF' }, { name: '100', hex: '#F0C2AF' }, { name: '200', hex: '#E79D80' },
      { name: '300', hex: '#DE784F' }, { name: '400', hex: '#D55420' }, { name: '500', hex: '#CF3B00' },
      { name: '600', hex: '#B53400' }, { name: '700', hex: '#8F2900' }, { name: '800', hex: '#681E00' },
      { name: '900', hex: '#411200' }, { name: '1000', hex: '#1A0700' },
    ] },
    { name: 'amber', colors: [
      { name: '50', hex: '#F7E9DE' }, { name: '100', hex: '#EBCAAF' }, { name: '200', hex: '#E0AB80' },
      { name: '300', hex: '#D48A4F' }, { name: '400', hex: '#C86B20' }, { name: '500', hex: '#C05600' },
      { name: '600', hex: '#A84B00' }, { name: '700', hex: '#843B00' }, { name: '800', hex: '#602B00' },
      { name: '900', hex: '#3C1B00' }, { name: '1000', hex: '#180B00' },
    ] },
  ] },
  { family: 'Yellows & Warm', palettes: [
    { name: 'tangerine', colors: [
      { name: '50', hex: '#FFD9BF' }, { name: '100', hex: '#FFB37F' }, { name: '200', hex: '#FF9852' },
      { name: '300', hex: '#FF7D24' }, { name: '400', hex: '#FF6800' }, { name: '500', hex: '#DF5B00' },
      { name: '600', hex: '#BF4E00' }, { name: '700', hex: '#9F4100' }, { name: '800', hex: '#803400' },
      { name: '900', hex: '#602700' }, { name: '1000', hex: '#401A00' },
    ] },
    { name: 'gold', colors: [
      { name: '50', hex: '#FEF3E2' }, { name: '100', hex: '#FCE1B5' }, { name: '200', hex: '#FACF8A' },
      { name: '300', hex: '#F8BD5D' }, { name: '400', hex: '#F6AB31' }, { name: '500', hex: '#F59F14' },
      { name: '600', hex: '#D68B12' }, { name: '700', hex: '#A96E0E' }, { name: '800', hex: '#7B500A' },
      { name: '900', hex: '#4D3206' }, { name: '1000', hex: '#1F1403' },
    ] },
    { name: 'salmon', colors: [
      { name: '50', hex: '#FFF4E9' }, { name: '100', hex: '#FFE3C9' }, { name: '200', hex: '#FFD2A9' },
      { name: '300', hex: '#FFC188' }, { name: '400', hex: '#FFB068' }, { name: '500', hex: '#FFA552' },
      { name: '600', hex: '#DF9048' }, { name: '700', hex: '#B07239' }, { name: '800', hex: '#805329' },
      { name: '900', hex: '#50341A' }, { name: '1000', hex: '#20150A' },
    ] },
    { name: 'yellow', colors: [
      { name: '50', hex: '#FFF7E3' }, { name: '100', hex: '#FFEBB8' }, { name: '200', hex: '#FFDF8E' },
      { name: '300', hex: '#FFD363' }, { name: '400', hex: '#FFC739' }, { name: '500', hex: '#FFBF1D' },
      { name: '600', hex: '#DFA719' }, { name: '700', hex: '#B08414' }, { name: '800', hex: '#80600F' },
      { name: '900', hex: '#503C09' }, { name: '1000', hex: '#201804' },
    ] },
    { name: 'sunflower', colors: [
      { name: '50', hex: '#FFFAEB' }, { name: '100', hex: '#FFF3CC' }, { name: '200', hex: '#FFEDAE' },
      { name: '300', hex: '#FFE58E' }, { name: '400', hex: '#FFDF70' }, { name: '500', hex: '#FFDA5C' },
      { name: '600', hex: '#DFBF51' }, { name: '700', hex: '#B0963F' }, { name: '800', hex: '#806D2E' },
      { name: '900', hex: '#50441D' }, { name: '1000', hex: '#201B0C' },
    ] },
    { name: 'citrus', colors: [
      { name: '50', hex: '#FDFADF' }, { name: '100', hex: '#F9F3AF' }, { name: '200', hex: '#F6EC80' },
      { name: '300', hex: '#F2E54F' }, { name: '400', hex: '#EEDE20' }, { name: '500', hex: '#ECD900' },
      { name: '600', hex: '#CEBE00' }, { name: '700', hex: '#A39600' }, { name: '800', hex: '#766D00' },
      { name: '900', hex: '#4A4400' }, { name: '1000', hex: '#1E1B00' },
    ] },
  ] },
  { family: 'Greens', palettes: [
    { name: 'lime', colors: [
      { name: '50', hex: '#F3F8E3' }, { name: '100', hex: '#E0EDBA' }, { name: '200', hex: '#CEE291' },
      { name: '300', hex: '#BBD767' }, { name: '400', hex: '#A9CC3F' }, { name: '500', hex: '#9DC523' },
      { name: '600', hex: '#89AC1F' }, { name: '700', hex: '#6C8818' }, { name: '800', hex: '#4C5F11' },
      { name: '900', hex: '#313E0B' }, { name: '1000', hex: '#141904' },
    ] },
    { name: 'emerald', colors: [
      { name: '50', hex: '#E5F8DF' }, { name: '100', hex: '#BDEFAF' }, { name: '200', hex: '#96E580' },
      { name: '300', hex: '#6EDB4F' }, { name: '400', hex: '#47D220' }, { name: '500', hex: '#2DCB00' },
      { name: '600', hex: '#27B200' }, { name: '700', hex: '#1F8C00' }, { name: '800', hex: '#176600' },
      { name: '900', hex: '#0E3F00' }, { name: '1000', hex: '#071F00' },
    ] },
    { name: 'green', colors: [
      { name: '50', hex: '#DFEDE4' }, { name: '100', hex: '#AFD2BC' }, { name: '200', hex: '#80B894' },
      { name: '300', hex: '#4F9D6B' }, { name: '400', hex: '#208344' }, { name: '500', hex: '#007129' },
      { name: '600', hex: '#006324' }, { name: '700', hex: '#004E1C' }, { name: '800', hex: '#003915' },
      { name: '900', hex: '#00230D' }, { name: '1000', hex: '#000E05' },
    ] },
    { name: 'florest', colors: [
      { name: '50', hex: '#E0E7E7' }, { name: '100', hex: '#B2C3C2' }, { name: '200', hex: '#859F9E' },
      { name: '300', hex: '#567A78' }, { name: '400', hex: '#295754' }, { name: '500', hex: '#0A3F3C' },
      { name: '600', hex: '#093735' }, { name: '700', hex: '#072B29' }, { name: '800', hex: '#05201E' },
      { name: '900', hex: '#031413' }, { name: '1000', hex: '#010808' },
    ] },
  ] },
  { family: 'Teals & Aquas', palettes: [
    { name: 'kiwi', colors: [
      { name: '50', hex: '#E7F5F5' }, { name: '100', hex: '#C2E6E6' }, { name: '200', hex: '#9ED7D7' },
      { name: '300', hex: '#79C8C8' }, { name: '400', hex: '#55B9B9' }, { name: '500', hex: '#3DAFAF' },
      { name: '600', hex: '#359999' }, { name: '700', hex: '#2A7979' }, { name: '800', hex: '#1F5858' },
      { name: '900', hex: '#133737' }, { name: '1000', hex: '#081616' },
    ] },
    { name: 'mint', colors: [
      { name: '50', hex: '#CAFDF1' }, { name: '100', hex: '#95FCE3' }, { name: '200', hex: '#2BF9C8' },
      { name: '300', hex: '#26DEB2' }, { name: '400', hex: '#22C29C' }, { name: '500', hex: '#1DA786' },
      { name: '600', hex: '#188C70' }, { name: '700', hex: '#13705A' }, { name: '800', hex: '#0F5544' },
      { name: '900', hex: '#0A3A2E' }, { name: '1000', hex: '#051E18' },
    ] },
    { name: 'ocean', colors: [
      { name: '50', hex: '#E2F9F7' }, { name: '100', hex: '#B7F1EC' }, { name: '200', hex: '#8CE8E1' },
      { name: '300', hex: '#60DFD6' }, { name: '400', hex: '#36D7CB' }, { name: '500', hex: '#19D1C3' },
      { name: '600', hex: '#16B7AB' }, { name: '700', hex: '#119087' }, { name: '800', hex: '#0D6962' },
      { name: '900', hex: '#08413D' }, { name: '1000', hex: '#031A18' },
    ] },
    { name: 'teal', colors: [
      { name: '50', hex: '#F2FAF9' }, { name: '100', hex: '#DFF3F0' }, { name: '200', hex: '#CDECE7' },
      { name: '300', hex: '#B9E4DE' }, { name: '400', hex: '#A7DDD5' }, { name: '500', hex: '#9AD8CF' },
      { name: '600', hex: '#87BDB5' }, { name: '700', hex: '#6A958F' }, { name: '800', hex: '#4D6C68' },
      { name: '900', hex: '#304441' }, { name: '1000', hex: '#131B1A' },
    ] },
  ] },
  { family: 'Blues', palettes: [
    { name: 'sky', colors: [
      { name: '50', hex: '#E8F6F8' }, { name: '100', hex: '#C5E8EE' }, { name: '200', hex: '#A3DBE4' },
      { name: '300', hex: '#7FCDD9' }, { name: '400', hex: '#5DC0CF' }, { name: '500', hex: '#46B7C8' },
      { name: '600', hex: '#3DA0AF' }, { name: '700', hex: '#307E8A' }, { name: '800', hex: '#235C64' },
      { name: '900', hex: '#16393F' }, { name: '1000', hex: '#091719' },
    ] },
    { name: 'steel', colors: [
      { name: '50', hex: '#DFF2F7' }, { name: '100', hex: '#AFE0EB' }, { name: '200', hex: '#80CDDF' },
      { name: '300', hex: '#4FBAD3' }, { name: '400', hex: '#20A8C7' }, { name: '500', hex: '#009BBF' },
      { name: '600', hex: '#0088A7' }, { name: '700', hex: '#006B84' }, { name: '800', hex: '#004E60' },
      { name: '900', hex: '#00303C' }, { name: '1000', hex: '#001318' },
    ] },
    { name: 'cyan', colors: [
      { name: '50', hex: '#DFF5FF' }, { name: '100', hex: '#AFE7FF' }, { name: '200', hex: '#80D8FF' },
      { name: '300', hex: '#4FC9FF' }, { name: '400', hex: '#20BBFF' }, { name: '500', hex: '#00B1FF' },
      { name: '600', hex: '#009BDF' }, { name: '700', hex: '#007AB0' }, { name: '800', hex: '#005980' },
      { name: '900', hex: '#003750' }, { name: '1000', hex: '#001620' },
    ] },
    { name: 'saphire', colors: [
      { name: '50', hex: '#E0ECFC' }, { name: '100', hex: '#B1D0F8' }, { name: '200', hex: '#83B5F5' },
      { name: '300', hex: '#5498F1' }, { name: '400', hex: '#267DED' }, { name: '500', hex: '#076AEA' },
      { name: '600', hex: '#065DCD' }, { name: '700', hex: '#0549A1' }, { name: '800', hex: '#043575' },
      { name: '900', hex: '#022149' }, { name: '1000', hex: '#010D1D' },
    ] },
    { name: 'marine', colors: [
      { name: '50', hex: '#E1E6FF' }, { name: '100', hex: '#B5C1FF' }, { name: '200', hex: '#899DFF' },
      { name: '300', hex: '#5B77FF' }, { name: '400', hex: '#3053FF' }, { name: '500', hex: '#123AFF' },
      { name: '600', hex: '#1032DB' }, { name: '700', hex: '#0C28B0' }, { name: '800', hex: '#091C7C' },
      { name: '900', hex: '#061250' }, { name: '1000', hex: '#020720' },
    ] },
    { name: 'blue', colors: [
      { name: '50', hex: '#D2DCF4' }, { name: '100', hex: '#B5C6EE' }, { name: '200', hex: '#8AA5E4' },
      { name: '300', hex: '#5D83D9' }, { name: '400', hex: '#3160CF' }, { name: '500', hex: '#144BC8' },
      { name: '600', hex: '#1242AF' }, { name: '700', hex: '#0E348A' }, { name: '800', hex: '#0A2564' },
      { name: '900', hex: '#06173F' }, { name: '1000', hex: '#030A19' },
    ] },
  ] },
  { family: 'Purples & Pinks', palettes: [
    { name: 'indigo', colors: [
      { name: '50', hex: '#DFE4E9' }, { name: '100', hex: '#AFBCC7' }, { name: '200', hex: '#8094A6' },
      { name: '300', hex: '#4F6B83' }, { name: '400', hex: '#204362' }, { name: '500', hex: '#00284C' },
      { name: '600', hex: '#002343' }, { name: '700', hex: '#001C34' }, { name: '800', hex: '#001426' },
      { name: '900', hex: '#000D18' }, { name: '1000', hex: '#00050A' },
    ] },
    { name: 'purple', colors: [
      { name: '50', hex: '#EBE7F3' }, { name: '100', hex: '#CDC2E2' }, { name: '200', hex: '#B09ED1' },
      { name: '300', hex: '#9179BF' }, { name: '400', hex: '#7455AE' }, { name: '500', hex: '#603DA2' },
      { name: '600', hex: '#54358E' }, { name: '700', hex: '#422A70' }, { name: '800', hex: '#301F51' },
      { name: '900', hex: '#1E1333' }, { name: '1000', hex: '#0C0814' },
    ] },
    { name: 'cassis', colors: [
      { name: '50', hex: '#EFE7F2' }, { name: '100', hex: '#D7C3DF' }, { name: '200', hex: '#C0A0CC' },
      { name: '300', hex: '#A87CB8' }, { name: '400', hex: '#9159A5' }, { name: '500', hex: '#814198' },
      { name: '600', hex: '#713985' }, { name: '700', hex: '#592D69' }, { name: '800', hex: '#41214C' },
      { name: '900', hex: '#281430' }, { name: '1000', hex: '#100813' },
    ] },
    { name: 'amethyst', colors: [
      { name: '50', hex: '#F4E6FD' }, { name: '100', hex: '#E5C3FB' }, { name: '200', hex: '#D6A0F9' },
      { name: '300', hex: '#C67DF7' }, { name: '400', hex: '#B75AF5' }, { name: '500', hex: '#A837F3' },
      { name: '600', hex: '#9205F0' }, { name: '700', hex: '#7504C0' }, { name: '800', hex: '#580390' },
      { name: '900', hex: '#3A0260' }, { name: '1000', hex: '#1D0130' },
    ] },
    { name: 'violet', colors: [
      { name: '50', hex: '#F8E0FD' }, { name: '100', hex: '#EEB1FA' }, { name: '200', hex: '#E582F8' },
      { name: '300', hex: '#DA52F5' }, { name: '400', hex: '#D124F2' }, { name: '500', hex: '#CA05F0' },
      { name: '600', hex: '#B104D2' }, { name: '700', hex: '#8B03A6' }, { name: '800', hex: '#650378' },
      { name: '900', hex: '#3F024B' }, { name: '1000', hex: '#19011E' },
    ] },
    { name: 'fucsia', colors: [
      { name: '50', hex: '#F0DFEA' }, { name: '100', hex: '#DAAFCC' }, { name: '200', hex: '#C480AD' },
      { name: '300', hex: '#AD4F8E' }, { name: '400', hex: '#972070' }, { name: '500', hex: '#88005B' },
      { name: '600', hex: '#770050' }, { name: '700', hex: '#5E003F' }, { name: '800', hex: '#44002D' },
      { name: '900', hex: '#2B001D' }, { name: '1000', hex: '#11000B' },
    ] },
    { name: 'pink', colors: [
      { name: '50', hex: '#FAE0F1' }, { name: '100', hex: '#F3B0DD' }, { name: '200', hex: '#EC82C9' },
      { name: '300', hex: '#E552B4' }, { name: '400', hex: '#DE23A1' }, { name: '500', hex: '#D90493' },
      { name: '600', hex: '#BE0481' }, { name: '700', hex: '#960365' }, { name: '800', hex: '#6D024A' },
      { name: '900', hex: '#44012E' }, { name: '1000', hex: '#1B0112' },
    ] },
    { name: 'pitaya', colors: [
      { name: '50', hex: '#FFE6F2' }, { name: '100', hex: '#FFC0DD' }, { name: '200', hex: '#FF9BCA' },
      { name: '300', hex: '#FF75B5' }, { name: '400', hex: '#FF50A1' }, { name: '500', hex: '#FF3794' },
      { name: '600', hex: '#DF3081' }, { name: '700', hex: '#B02666' }, { name: '800', hex: '#801C4A' },
      { name: '900', hex: '#50112E' }, { name: '1000', hex: '#200713' },
    ] },
    { name: 'rose', colors: [
      { name: '50', hex: '#FADFEB' }, { name: '100', hex: '#F4B0CC' }, { name: '200', hex: '#ED81AF' },
      { name: '300', hex: '#E65090' }, { name: '400', hex: '#E01F70' }, { name: '500', hex: '#DB025E' },
      { name: '600', hex: '#C00252' }, { name: '700', hex: '#970141' }, { name: '800', hex: '#6E012F' },
      { name: '900', hex: '#44011D' }, { name: '1000', hex: '#1B000C' },
    ] },
  ] },
];

/* ═══════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════ */

/** Renders a two-column sizing table */
function SizingTable({ headers, rows }) {
  return (
    <table>
      <thead>
        <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(([scale, value]) => (
          <tr key={scale}>
            <td><code>{scale}</code></td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Renders a row of color swatches */
function SwatchRow({ colors }) {
  return (
    <div className="swatch-row">
      {colors.map((c) => (
        <div key={c.name} style={{ textAlign: 'center' }}>
          <div className="sw" style={{ background: c.hex }} title={c.name} />
          <div style={{ fontSize: 10, color: '#a3a3a3', marginTop: 4 }}>{c.name}</div>
        </div>
      ))}
    </div>
  );
}

/** Renders an alpha base-color table */
function AlphaTable({ alpha }) {
  return (
    <>
      <h4>Alpha base colors</h4>
      <table>
        <thead>
          <tr><th>Escala</th><th>Opacidade</th><th>Base Color</th></tr>
        </thead>
        <tbody>
          {alpha.map((a) => (
            <tr key={a.name}>
              <td><code>{a.name}</code></td>
              <td>{a.opacity}</td>
              <td>
                <span
                  className="sw"
                  style={{
                    background: a.hex,
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    verticalAlign: 'middle',
                    borderRadius: 3,
                  }}
                />{' '}
                <code>{a.hex}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function BaseTokens() {
  return (
    <div>
      {/* ── Title ── */}
      <LfHeading as="h1">Base Tokens</LfHeading>
      <p className="subtitle">
        A camada mais primitiva do sistema — valores brutos de sizing e cores que alimentam todas as outras camadas.
      </p>

      {/* ── O que são ── */}
      <LfHeading as="h2">O que são</LfHeading>
      <LfParagraph>
        Os Base Tokens são a camada mais fundamental do Lift DS. Eles armazenam{' '}
        <strong>todos os valores brutos</strong> do sistema, organizados em duas coleções:{' '}
        <strong>Sizing</strong> (dimensões, espaçamentos, tipografia, animações) e{' '}
        <strong>Colors</strong> (~50 paletas de cores). Utilizam o prefixo <code>LfBs</code>{' '}
        (JavaScript) / <code>--lf-bs-</code> (CSS).
      </LfParagraph>
      <LfAlert variant="warning">
        Os Base Tokens representam uma camada de controle e{' '}
        <strong>não devem ser aplicados diretamente nas interfaces</strong>. Para isso, deve-se
        utilizar os Theme Tokens (Usage Tokens).
      </LfAlert>

      {/* ════════════════════════════════════════════
          COLLECTION 1: SIZING
          ════════════════════════════════════════════ */}
      <LfHeading as="h2">Collection 1: Sizing</LfHeading>
      <LfParagraph>
        Coleção de valores dimensionais e utilitários. Mode: <code>Base Tokens</code>.
      </LfParagraph>

      {/* border / radius */}
      <LfHeading as="h3">border / radius</LfHeading>
      <LfParagraph>Escala de arredondamento de 0 a 1000 + pill. 12 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={BORDER_RADIUS} />

      {/* border / width */}
      <LfHeading as="h3">border / width</LfHeading>
      <LfParagraph>Espessura das bordas. Escala de 0 a 400. 5 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={BORDER_WIDTH} />

      {/* font / size */}
      <LfHeading as="h3">font / size</LfHeading>
      <LfParagraph>Tamanhos de fonte. Escala de 50 a 2800. 29 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={FONT_SIZE} />

      {/* font / weight */}
      <LfHeading as="h3">font / weight</LfHeading>
      <LfParagraph>Pesos tipográficos. Escala de 100 a 900. 9 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor']} rows={FONT_WEIGHT} />

      {/* font / line height */}
      <LfHeading as="h3">font / line height</LfHeading>
      <LfParagraph>Alturas de linha. Escala de 50 a 2800. 29 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={LINE_HEIGHT} />

      {/* font / paragraph spacing */}
      <LfHeading as="h3">font / paragraph spacing</LfHeading>
      <LfParagraph>Espaçamento entre parágrafos. 2 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={PARAGRAPH_SPACING} />

      {/* spacing */}
      <LfHeading as="h3">spacing</LfHeading>
      <LfParagraph>Escala unificada de espaçamento. De 0 a 1900. 31 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={SPACING} />

      {/* opacity */}
      <LfHeading as="h3">opacity</LfHeading>
      <LfParagraph>Escala de opacidade. De 5% a 100%. 13 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor']} rows={OPACITY} />

      {/* breakpoint */}
      <LfHeading as="h3">breakpoint</LfHeading>
      <LfParagraph>Pontos de quebra responsivos. 5 tokens.</LfParagraph>
      <SizingTable headers={['Nome', 'Valor (px)']} rows={BREAKPOINT} />

      {/* z-index */}
      <LfHeading as="h3">z-index</LfHeading>
      <LfParagraph>Camadas de empilhamento. De 0 a 1080. 19 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor']} rows={ZINDEX} />

      {/* motion / duration */}
      <LfHeading as="h3">motion / duration</LfHeading>
      <LfParagraph>Durações de animação e transição. De 0ms a 5000ms. 14 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor']} rows={MOTION_DURATION} />

      {/* motion / movement */}
      <LfHeading as="h3">motion / movement</LfHeading>
      <LfParagraph>Curvas de easing para animações. 5 tokens.</LfParagraph>
      <table>
        <thead>
          <tr><th>Nome</th><th>Valor</th></tr>
        </thead>
        <tbody>
          {MOTION_MOVEMENT.map(([name, value]) => (
            <tr key={name}>
              <td><code>{name}</code></td>
              <td><code>{value}</code></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* shadow / offset */}
      <LfHeading as="h3">shadow / offset</LfHeading>
      <LfParagraph>Deslocamento de sombras. Escala de 0 a 1600. 19 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={SHADOW_OFFSET} />

      {/* shadow / blur */}
      <LfHeading as="h3">shadow / blur</LfHeading>
      <LfParagraph>Desfoque de sombras. Escala de 0 a 1600. 19 tokens.</LfParagraph>
      <SizingTable headers={['Escala', 'Valor (px)']} rows={SHADOW_BLUR} />

      {/* shadow / color */}
      <LfHeading as="h3">shadow / color</LfHeading>
      <LfParagraph>Cor base para sombras. 1 token.</LfParagraph>
      <table>
        <thead>
          <tr><th>Nome</th><th>Referência</th><th>Valor</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>fill</code></td>
            <td>gray-light/400a</td>
            <td><code>#444444</code></td>
          </tr>
        </tbody>
      </table>

      {/* ════════════════════════════════════════════
          COLLECTION 2: COLORS
          ════════════════════════════════════════════ */}
      <LfHeading as="h2">Collection 2: Colors</LfHeading>
      <LfParagraph>
        Coleção de paletas de cores. Mode: <code>Mode</code>. Aproximadamente 50 paletas
        organizadas por família cromática.
      </LfParagraph>

      {COLOR_FAMILIES.map((fam) => (
        <React.Fragment key={fam.family}>
          <LfHeading as="h2" style={{ marginTop: 32 }}>{fam.family}</LfHeading>
          {fam.palettes.map((palette) => (
            <React.Fragment key={palette.name}>
              <LfHeading as="h3">{palette.name}</LfHeading>
              <SwatchRow colors={palette.colors} />
              {palette.alpha && <AlphaTable alpha={palette.alpha} />}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
