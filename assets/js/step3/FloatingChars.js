(function() {

  var sample = window.sample || {};
  window.sample = sample;

  /**
   * THREE.Meshを拡張した独自3Dオブジェクトクラス
   * @param {number} numChars - テクスチャの文字数
   * @param {number} charWidth - 文字の幅 [px]
   * @param {number} numTextureGridCols - テクスチャの1行文の文字列
   * @param {number} textureGridSize - テクスチャの1文字分の幅
   */
  sample.FloatingChars = function(numChars, charWidth, numTextureGridCols, textureGridSize) {
    this.numChars = numChars;
    this.charWidth = charWidth;
    this.numTextureGridCols = numTextureGridCols;
    this.textureGridSize = textureGridSize;

    // カスタムジオメトリオブジェクトをインスタンス化
    geometry = new sample.FloatingCharsGeometry(this.numChars, this.charWidth);

    // RawShaderMaterial生成
    material = new THREE.RawShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        txtTexture: { type: 't' },
        time: { type: '1f', value: 0 },
        numChars: { type: '1f', value: this.numChars }
      },
      vertexShader: $('#vertexShader').text(),
      fragmentShader: $('#fragmentShader').text()
    });

    THREE.Mesh.call(this, geometry, material);
  }

  sample.FloatingChars.prototype = Object.create(THREE.Mesh.prototype, { value: { constructor: THREE.Mesh }});


  /**
   * 更新
   */
  sample.FloatingChars.prototype.update = function() {
    // 経過時間を更新してシェーダに渡す
    this.material.uniforms.time.value += 0.001;
  }


  /**
   * テクスチャを生成
   * @param {string} txt - テクスチャとして使用したい文字列
   * @param {string} fontFamily - フォント名
   */
  sample.FloatingChars.prototype.createTxtTexture = function(txt, fontFamily) {
    this.txtCanvas = document.createElement('canvas');
    this.txtCanvasCtx = this.txtCanvas.getContext('2d');
    this.txtCanvas.width = this.textureGridSize * this.numTextureGridCols;
    this.txtCanvas.height = this.textureGridSize * Math.ceil(txt.length / this.numTextureGridCols);

    var textureTxtLength = txt.length;

    // canvasのスタイルを設定
    this.txtCanvasCtx.clearRect(0, 0, this.txtCanvas.width, this.txtCanvas.height);
    this.txtCanvasCtx.font = 'normal ' + (this.textureGridSize * 0.8) + 'px ' + fontFamily;
    this.txtCanvasCtx.textAlign = 'center';
    this.txtCanvasCtx.fillStyle = '#ffffff';

    var colIndex;
    var rowIndex;

    for(var i  = 0, l = textureTxtLength; i < l; i++) {
      colIndex = i % this.numTextureGridCols;
      rowIndex = Math.floor(i / this.numTextureGridCols);

      // canvasに文字を描画
      this.txtCanvasCtx.fillText(
        txt.charAt(i),
        colIndex * this.textureGridSize + this.textureGridSize / 2,
        rowIndex * this.textureGridSize + this.textureGridSize * 0.8,
        this.textureGridSize
      );
    }

    // canvasからthree.jsのテクスチャを生成
    this.txtTexture = new THREE.Texture(this.txtCanvas);
    this.txtTexture.flipY = false;
    this.txtTexture.needsUpdate = true;

    // シェーダに渡す値にテクスチャをセット
    this.material.uniforms.txtTexture.value = this.txtTexture;

    // document.body.appendChild(this.txtCanvas);
    // $(this.txtCanvas).css('background-color', '#000');
    // $('#wrapper').remove();
  }


  /**
   * uniformの値をセット
   */
  sample.FloatingChars.prototype.setUniform = function(uniformKey, value) {
    this.material.uniforms[uniformKey].value = value;
  }




})();
