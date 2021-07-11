import { createMergedStream } from '../lib/generac/src/create-merged-stream';
import {randomStream} from '../lib/generac/src/utils'
import {html, render, } from 'lit-html';
import {asyncReplace} from 'lit-html/directives/async-replace';

console.log('index')
async function * randomGrid(width: number, height: number) {
  const streams = []
  let i = 0;
  while (i < width * height) {
    streams[i] = randomStream(50)
    i++;
  }

  const grid = [...new Array(height)].map(() => new Array(width).fill(0))

  for await (const msg of createMergedStream(...streams)) {
    const x = msg.meta.index % width;
    const y = Math.floor(msg.meta.index / width)
    // console.log(`${x}, ${y} : ${msg.value}`);
    grid[x][y] = msg.value
    yield grid;
  }
}

const MULTIPLIER = 12

async function * tiles(width = MULTIPLIER, height = MULTIPLIER) {
  for await (const grid of randomGrid(width, height)) {
    yield html`
      <div class="grid" style="display: grid; grid-template-rows: repeat(${height}, 1fr); grid-template-columns: ${width};">
        ${grid.map((row, i) => row.map((val, j) => html`
          <span class="cell" style="--alpha: ${val / MULTIPLIER}; grid-column: ${j + 1}; grid-row: ${i + 1}"></span>
        `))}
      </div>
    `
  }
}

// render(asyncReplace(tiles()), document.getElementById("experiment-root") as HTMLElement)


function tilesMethodTwo(width: number = 12, height: number = 12, freq: number = 500) {

  function cellsTemplate() {
    let cells = []
    for (let i = 0; i < height; i = i + 1) {
      for (let j = 0; j < width; j = j + 1) {
        cells.push(asyncReplace(tile({
          x: j,
          y: i,
          freq,
        })));
      }
    }

    return cells;
  }

  return html`
    <div class="grid-two" style="--grid-width: ${width}; --grid-height: ${height}">
      ${cellsTemplate()}
    </div>
  `
}

async function * tile({x, y, freq}: {x: number, y: number, freq: number}) {
  let isHovered = false;
  console.log(`re-render : ${x}, ${y}`)
  for await (const msg of randomStream(freq)) {
    yield html`
      <span class="cell-two ${isHovered ? 'flipped' : ''}" style="--cell-x: ${x}; --cell-y: ${y}; --cell-v: ${msg / freq}"></span>
    `
  }
}

const WIDTH = 25
const HEIGHT = 25
const FREQ_MS = 5000
render(tilesMethodTwo(WIDTH, HEIGHT, FREQ_MS), document.getElementById("experiment-root") as HTMLElement)