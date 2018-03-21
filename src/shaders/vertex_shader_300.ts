export const vertex_shader_300 = "#version 300 es\r\nin highp float aVertexIndex;\r\nin highp float aTransformationIndex;\r\nin highp float aStyleIndex;\r\nin highp float aProduct;\r\nin highp vec2 aState;\r\nin highp vec2 aNormal;\r\n\r\n\r\nuniform mat4 uMVMatrix;\r\nuniform mat4 uPMatrix;\r\n\r\n\r\nuniform vec4 uHighlightColour;\r\n\r\n\r\nuniform float uMeter;\r\n\r\n\r\n\r\nuniform int uColorCoding;\r\n\r\n\r\n\r\n\r\n\r\n\r\nuniform int uRenderingMode;\r\n\r\n\r\nuniform highp sampler2D uVertexSampler;\r\nuniform highp float uVertexTextureSize;\r\n\r\n\r\nuniform highp sampler2D uMatrixSampler;\r\nuniform highp float uMatrixTextureSize;\r\n\r\n\r\nuniform highp sampler2D uStyleSampler;\r\nuniform highp float uStyleTextureSize;\r\n\r\n\r\nuniform highp sampler2D uStateStyleSampler;\r\n\r\n\r\nout vec4 vColor;\r\n\r\nout vec3 vPosition;\r\n\r\nout vec3 vNormal;\r\n\r\nout mediump float vDiscard;\r\n\r\nconst float PI = 3.1415926535897932384626433832795;\r\n\r\nvec3 getNormal(mat4 transform) {\r\n float U = aNormal[0];\r\n float V = aNormal[1];\r\n float lon = U / 252.0 * 2.0 * PI;\r\n float lat = V / 252.0 * PI;\r\n\r\n float x = sin(lon) * sin(lat);\r\n float z = cos(lon) * sin(lat);\r\n float y = cos(lat);\r\n\r\n vec3 normal = vec3(x, y, z);\r\n if (aTransformationIndex < -0.5) {\r\n return normalize(normal);\r\n }\r\n\r\n \r\n \r\n \r\n \r\n mat3 normTrans = mat3(transform);\r\n\r\n return normalize(vec3(normTrans * normal));\r\n}\r\n\r\nvec4 getIdColor(float id) {\r\n float B = floor(id / (256.0*256.0));\r\n float G = floor((id - B * 256.0*256.0) / 256.0);\r\n float R = mod(id, 256.0);\r\n \r\n \r\n\r\n return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0);\r\n}\r\n\r\nvec2 getTextureCoordinates(float index, float size)\r\n{\r\n float x = floor(mod(index + 0.5, size)); \r\n float y = floor((index + 0.5)/ size); \r\n \r\n return vec2((x + 0.5) / size, (y + 0.5) / size);\r\n}\r\n\r\n\r\nvec4 getColor() { \r\n \r\n float restyle = aState[1];\r\n if (restyle > 224.5) {\r\n vec2 coords = getTextureCoordinates(aStyleIndex, uStyleTextureSize);\r\n vec4 col = texture(uStyleSampler, coords);\r\n \r\n \r\n if (uRenderingMode == 1) {\r\n float intensity = (col.r + col.g + col.b) / 3.0;\r\n return vec4(intensity, intensity, intensity, col.a);\r\n }\r\n\r\n \r\n return col;\r\n }\r\n\r\n \r\n \r\n vec2 coords = getTextureCoordinates(restyle, 15.0);\r\n vec4 col2 = texture(uStateStyleSampler, coords);\r\n\r\n \r\n if (uRenderingMode == 1) {\r\n float intensity = (col2.r + col2.g + col2.b) / 3.0;\r\n return vec4(intensity, intensity, intensity, col2.a);\r\n }\r\n\r\n return col2;\r\n}\r\n\r\nvec3 getVertexPosition(mat4 transform) {\r\n vec2 coords = getTextureCoordinates(aVertexIndex, uVertexTextureSize);\r\n vec3 point = vec3(texture(uVertexSampler, coords));\r\n\r\n if (aTransformationIndex < -0.5) {\r\n return point;\r\n }\r\n\r\n return vec3(transform * vec4(point, 1.0));\r\n}\r\n\r\nmat4 getTransform() {\r\n if (aTransformationIndex < -0.5) {\r\n return mat4(1.0);\r\n }\r\n\r\n float tIndex = aTransformationIndex * 4.0;\r\n\r\n \r\n vec2 c1 = getTextureCoordinates(tIndex, uMatrixTextureSize);\r\n vec2 c2 = getTextureCoordinates(tIndex + 1.0, uMatrixTextureSize);\r\n vec2 c3 = getTextureCoordinates(tIndex + 2.0, uMatrixTextureSize);\r\n vec2 c4 = getTextureCoordinates(tIndex + 3.0, uMatrixTextureSize);\r\n\r\n \r\n vec4 v1 = texture(uMatrixSampler, c1);\r\n vec4 v2 = texture(uMatrixSampler, c2);\r\n vec4 v3 = texture(uMatrixSampler, c3);\r\n vec4 v4 = texture(uMatrixSampler, c4);\r\n\r\n \r\n return mat4(v1, v2, v3, v4);\r\n}\r\n\r\nvoid main(void) {\r\n int state = int(floor(aState[0] + 0.5));\r\n vDiscard = 0.0;\r\n\r\n if (state == 254 || \r\n (uColorCoding == -1 && state == 251) || \r\n (uColorCoding == -1 && (\r\n (uRenderingMode == 2 && state != 253 && state != 252) || \r\n (uRenderingMode == 3 && (state == 253 || state == 252))) \r\n ))\r\n {\r\n vDiscard = 1.0;\r\n vColor = vec4(0.0, 0.0, 0.0, 0.0);\r\n vNormal = vec3(0.0, 0.0, 0.0);\r\n vPosition = vec3(0.0, 0.0, 0.0);\r\n gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\r\n return;\r\n }\r\n\r\n \r\n mat4 transform = getTransform();\r\n vPosition = getVertexPosition(transform);\r\n vNormal = getNormal(transform);\r\n\r\n \r\n if (uColorCoding == -2) {\r\n float id = floor(aProduct + 0.5);\r\n vColor = getIdColor(id);\r\n vNormal = vec3(0.0, 0.0, 0.0);\r\n }\r\n \r\n else if (uColorCoding >= 0) {\r\n float id = float(uColorCoding);\r\n vColor = getIdColor(id);\r\n vNormal = vec3(0.0, 0.0, 0.0);\r\n }\r\n \r\n else {\r\n \r\n vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n \r\n if (state == 253) {\r\n baseColor = uHighlightColour;\r\n \r\n }\r\n else if (uRenderingMode == 2 || uRenderingMode == 3) {\r\n \r\n if (state == 252) { \r\n baseColor = getColor();\r\n }\r\n \r\n else {\r\n baseColor = vec4(0.0, 0.0, 0.3, 0.5); \r\n }\r\n }\r\n else {\r\n \r\n baseColor = getColor();\r\n }\r\n\r\n \r\n if (baseColor.a < 0.98 && uRenderingMode == 0)\r\n {\r\n vec3 trans = -0.002 * uMeter * normalize(vNormal);\r\n vPosition = vPosition + trans;\r\n }\r\n\r\n \r\n vColor = baseColor;\r\n }\r\n\r\n \r\n gl_Position = uPMatrix * uMVMatrix * vec4(vPosition, 1.0);\r\n}"