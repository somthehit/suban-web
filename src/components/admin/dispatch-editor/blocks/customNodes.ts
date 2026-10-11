"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { OpticsBlockComponent } from "./OpticsBlock";
import { FieldStatsBlockComponent } from "./FieldStatsBlock";
import { AudioSoundscapeBlockComponent } from "./AudioSoundscapeBlock";
import { MapSchematicBlockComponent } from "./MapSchematicBlock";
import { ShopPrintBlockComponent } from "./ShopPrintBlock";
import { EthicsProtocolBlockComponent } from "./EthicsProtocolBlock";
import { SpeciesCardBlockComponent } from "./SpeciesCardBlock";
import { CalloutBlockComponent } from "./CalloutBlock";
import { GearListBlockComponent } from "./GearListBlock";

// 1. Optics & Field Telemetry Node
export const OpticsNode = Node.create({
  name: "opticsBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      bodyRig: { default: "Nikon Z9 Flagship (Dual CFexpress)" },
      primaryGlass: { default: "Nikkor Z 400mm f/2.8 TC VR S" },
      effectiveFocal: { default: "560mm (Internal 1.4x Active)" },
      exposureValues: { default: "1/1600s • f/4.0 • ISO 3200" },
      shutterProfile: { default: "Silent Electronic (0.0dB)" },
      afAlgorithm: { default: "3D Matrix Animal Eye-AF" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="optics-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "optics-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(OpticsBlockComponent);
  },
});

// 2. High-Altitude Telemetry Ribbon Node
export const FieldStatsNode = Node.create({
  name: "fieldStatsBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      waypoint: { default: "28°23′14″N 81°18′02″E" },
      elevation: { default: "152m AMSL (Bardia Basin)" },
      temperature: { default: "9.4°C / 48.9°F (Mist Drop)" },
      acoustics: { default: "32 dB (Ambient Forest)" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="field-stats-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "field-stats-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FieldStatsBlockComponent);
  },
});

// 3. Binaural Audio Soundscape Node
export const AudioSoundscapeNode = Node.create({
  name: "audioSoundscapeBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      title: { default: "Babai River Dawn Soundscape (Ambient 3D Audio)" },
      duration: { default: "04:15 AM • 4m 20s" },
      format: { default: "32-Bit Float Ambisonics" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="audio-soundscape-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "audio-soundscape-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioSoundscapeBlockComponent);
  },
});

// 4. Topographic Map Schematic Node
export const MapSchematicNode = Node.create({
  name: "mapSchematicBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      title: { default: "Transect 4B: Babai River Confluence Hide" },
      scale: { default: "Scale: 1:25,000 Expedition Grid" },
      blindPos: { default: "Blind Alpha Pos: 28°23′14″N" },
      apexVector: { default: "Apex Sighting Vector: 194° SSW" },
      distance: { default: "Distance: 48.6m Direct" },
      mapBg: {
        default:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAGvlNdScL8Eaw68MmkUWl0yQirH3gbqyMWIYJr1Pmz_59DqSKiPqtC5ap4fV0MLk4eAwDqcRLG4OCT-CwpHJx7L8RTMMzNNMz18alO8AOdzn8e34LIafZhyzTZAr7ZCtAb6ITBc79MDttcg9F87EL94D1n2V8UXRJNmC9gNKqt9sP_mGZcajvsAgtz8j7Zl7b22Ub7G7y0v9oqDNdFKhNvlsR-OAcg-IGBjwlh1Pch",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="map-schematic-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "map-schematic-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MapSchematicBlockComponent);
  },
});

// 5. Shop This Photo / Fine Art Print Node
export const ShopPrintNode = Node.create({
  name: "shopPrintBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      title: { default: "Acquire Limited Fine Art Print or Commercial RAW License" },
      subtitle: {
        default:
          "Hand-signed, embossed with digital cryptographic provenance. 100% archival pigment print rated for 150+ years lightfastness.",
      },
      edition: { default: "Edition 04 / 25" },
      paper: { default: "Archival Museum Rag / Hahnemühle" },
      image: {
        default:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBkIjaJgW6V2K5nhQw4YsdxkZwtamfhDsLNdCTVS8ZA2wRSczAvDlhCqvgXSzvHHJ6_wDbGUNbMzmKjLXzqZrlVR7N4B_-kklNEZypcUxjrhpRVCvtpCrMoLDz-vF_5Gx17Y5I50xg6OqSFB2OcpME5MxluDo_FX5F0pRfNHzqE1eVIERY6hg0nxdO6wnUB4vdqxGBmcHX8a6jCDcrOXO-Kug7WIsNhCtHZCPkpRIS4",
      },
      rawPrice: { default: "$39" },
      commPrice: { default: "$180" },
      printPrice: { default: "$350" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="shop-print-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "shop-print-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShopPrintBlockComponent);
  },
});

// 6. Ethical Wildlife Photography Protocol Node
export const EthicsProtocolNode = Node.create({
  name: "ethicsProtocolBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      card1Title: { default: "Zero Infiltration" },
      card1Desc: {
        default: "Strict non-invasive blinds. No acoustic playback, baiting, or tree platforms were utilized.",
      },
      card2Title: { default: "Non-Disruptive Drone Ban" },
      card2Desc: {
        default: "100% aerial drone exclusion applied. Compliant with Bardia National Park buffer-zone laws.",
      },
      card3Title: { default: "10% Direct Royalty" },
      card3Desc: {
        default: "10% of all image sales from this dispatch go directly to Community Anti-Poaching Units (CBAPU).",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="ethics-protocol-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "ethics-protocol-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EthicsProtocolBlockComponent);
  },
});

// 7. Species Profile Card Node
export const SpeciesCardNode = Node.create({
  name: "speciesCardBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      commonName: { default: "Royal Bengal Tiger" },
      scientificName: { default: "Panthera tigris tigris" },
      iucnStatus: { default: "Endangered (IUCN 3.1)" },
      population: { default: "~355 in Nepal (2022 Census)" },
      habitat: { default: "Dense Sal Forest & Alluvial Grassland" },
      keyBehavior: { default: "Solitary, crepuscular river-stalking" },
      image: {
        default:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDCpf5U2dkfjFHjrm7Ar0JWd4ol2oSojuqHRw0SsROkoapkBkLZW3d-8oTSRbUtcR8eWq7mpTDECFIWf6sHyIoZ7UnVSpnaPA9FgbEWamuorPFPUeGv7rjOyMKI4kaaR6mUWA0vQBhkntUksogD9j8uXjVMgF3pU9jHdEMn7LEN96IXOs6dVA-dj0Ou5FNGIPSMZ1vgqMN_0n3ZrOBQOc4KAEYDdOSZaxRTtm0Mw2Sd",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="species-card-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "species-card-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SpeciesCardBlockComponent);
  },
});

// 8. Naturalist Callout Node
export const CalloutNode = Node.create({
  name: "calloutBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      type: { default: "expedition" },
      title: { default: "Field Caution • Monsoon Silt Risk" },
      content: {
        default:
          "High river turbidity reduces reflection clarity and increases bank subsidence danger. Maintain at least 15m distance from undercut banks.",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "callout-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutBlockComponent);
  },
});

// 9. Equipment / Gear List Node
export const GearListNode = Node.create({
  name: "gearListBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      category: { default: "Expedition Optical Loadout" },
      items: {
        default: [
          "Primary: Nikon Z9 Flagship + Nikkor Z 400mm f/2.8 TC VR S",
          "Secondary: Nikon Z8 Flagship + Nikkor Z 70-200mm f/2.8 VR S",
          "Support: Gitzo Systematic Series 5 Carbon + Wimberley WH-200 Gimbal",
          "Field Audio: Zoom F3 32-Bit Float Recorder + Sennheiser MKH 416",
          "Power: 4x EN-EL18d Batteries + Goal Zero 100W Expedition Solar Panel",
        ],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gear-list-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "gear-list-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GearListBlockComponent);
  },
});

export const customEditorExtensions = [
  OpticsNode,
  FieldStatsNode,
  AudioSoundscapeNode,
  MapSchematicNode,
  ShopPrintNode,
  EthicsProtocolNode,
  SpeciesCardNode,
  CalloutNode,
  GearListNode,
];
