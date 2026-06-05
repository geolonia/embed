import { test } from '@playwright/test';

// embed (wrapper) 固有: renderGeoloniaMap() 内で pmtiles プロトコルを登録する
// (maplibregl.addProtocol('pmtiles', ...))。maps-core では import 時に登録され、
// 登録タイミングが異なる。
//
// E2E で「登録タイミング」を堅牢に検証するのは難しく (グローバルな protocol 登録は
// 観測しづらく、実 pmtiles ソースの用意も要る)、得られる回帰検知の価値が低い。
// 実 pmtiles ソースを用いた描画検証は maps-core 側 / ユニットで担保する想定。
// 取りこぼしを明示するため、ここでは skip として残す (silent に落とさない)。
test.skip('renderGeoloniaMap 内で pmtiles プロトコルが登録される (maps-core/ユニットで担保)', async () => {
  // intentionally skipped — see comment above
});
