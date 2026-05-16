const mangoAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 120,
  w: 320,
  h: 320,
  nm: "mango-bounce",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "mango-shape",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [160, 165, 0] },
            { t: 30, s: [160, 150, 0] },
            { t: 60, s: [160, 165, 0] },
            { t: 90, s: [160, 150, 0] },
            { t: 120, s: [160, 165, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [130, 170] },
              nm: "mango-body"
            },
            { ty: "fl", c: { a: 0, k: [0.98, 0.73, 0.09, 1] }, o: { a: 0, k: 100 }, nm: "fill" },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: -18 }, o: { a: 0, k: 100 } }
          ],
          nm: "mango-group"
        },
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: { i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-12, -86], [0, -108], [18, -84]], c: true }
              },
              nm: "leaf"
            },
            { ty: "fl", c: { a: 0, k: [0.08, 0.5, 0.23, 1] }, o: { a: 0, k: 100 }, nm: "leaf-fill" },
            { ty: "tr", p: { a: 0, k: [15, -10] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "leaf-group"
        }
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0
    }
  ]
};

export default mangoAnimation;
