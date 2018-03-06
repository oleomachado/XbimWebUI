export const vertex_shader = "attribute highp float aVertexIndex; attribute highp float aTransformationIndex; attribute highp float aStyleIndex; attribute highp float aProduct; attribute highp vec2 aState; attribute highp vec2 aNormal; uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform vec4 ulightA; uniform vec4 ulightB; uniform vec4 uHighlightColour; uniform float uMeter; uniform int uColorCoding; uniform int uRenderingMode; uniform highp sampler2D uVertexSampler; uniform highp float uVertexTextureSize; uniform highp sampler2D uMatrixSampler; uniform highp float uMatrixTextureSize; uniform highp sampler2D uStyleSampler; uniform highp float uStyleTextureSize; uniform highp sampler2D uStateStyleSampler; varying vec4 vFrontColor; varying vec4 vBackColor; varying vec3 vPosition; varying float vDiscard; const float PI = 3.1415926535897932384626433832795; vec3 getNormal(mat4 transform) { float U = aNormal[0]; float V = aNormal[1]; float lon = U / 252.0 * 2.0 * PI; float lat = V / 252.0 * PI; float x = sin(lon) * sin(lat); float z = cos(lon) * sin(lat); float y = cos(lat); vec3 normal = vec3(x, y, z); if (aTransformationIndex < -0.5) { return normalize(normal); } mat3 normTrans = mat3(transform); return normalize(vec3(normTrans * normal)); } vec4 getIdColor(float id) { float B = floor(id / (256.0*256.0)); float G = floor((id - B * 256.0*256.0) / 256.0); float R = mod(id, 256.0); return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0); } vec2 getTextureCoordinates(float index, float size) { float x = floor(mod(index + 0.5, size)); float y = floor((index + 0.5)/ size); return vec2((x + 0.5) / size, (y + 0.5) / size); } vec4 getColor() { float restyle = aState[1]; if (restyle > 224.5) { vec2 coords = getTextureCoordinates(aStyleIndex, uStyleTextureSize); vec4 col = texture2D(uStyleSampler, coords); if (uRenderingMode == 1) { float intensity = (col.r + col.g + col.b) / 3.0; return vec4(intensity, intensity, intensity, col.a); } return col; } vec2 coords = getTextureCoordinates(restyle, 15.0); vec4 col2 = texture2D(uStateStyleSampler, coords); if (uRenderingMode == 1) { float intensity = (col2.r + col2.g + col2.b) / 3.0; return vec4(intensity, intensity, intensity, col2.a); } return col2; } vec3 getVertexPosition(mat4 transform) { vec2 coords = getTextureCoordinates(aVertexIndex, uVertexTextureSize); vec3 point = vec3(texture2D(uVertexSampler, coords)); if (aTransformationIndex < -0.5) { return point; } return vec3(transform * vec4(point, 1.0)); } mat4 getTransform() { if (aTransformationIndex < -0.5) { return mat4(1.0); } float tIndex = aTransformationIndex * 4.0; vec2 c1 = getTextureCoordinates(tIndex, uMatrixTextureSize); vec2 c2 = getTextureCoordinates(tIndex + 1.0, uMatrixTextureSize); vec2 c3 = getTextureCoordinates(tIndex + 2.0, uMatrixTextureSize); vec2 c4 = getTextureCoordinates(tIndex + 3.0, uMatrixTextureSize); vec4 v1 = texture2D(uMatrixSampler, c1); vec4 v2 = texture2D(uMatrixSampler, c2); vec4 v3 = texture2D(uMatrixSampler, c3); vec4 v4 = texture2D(uMatrixSampler, c4); return mat4(v1, v2, v3, v4); } void main(void) { int state = int(floor(aState[0] + 0.5)); vDiscard = 0.0; if (state == 254 || (uColorCoding == -1 && state == 251) || (uColorCoding == -1 && ( (uRenderingMode == 2 && state != 253 && state != 252) || (uRenderingMode == 3 && (state == 253 || state == 252))) )) { vDiscard = 1.0; vFrontColor = vec4(0.0, 0.0, 0.0, 0.0); vBackColor = vec4(0.0, 0.0, 0.0, 0.0); vPosition = vec3(0.0, 0.0, 0.0); gl_Position = vec4(0.0, 0.0, 0.0, 1.0); return; } float tIndex = aTransformationIndex * 4.0; float tSize = uMatrixTextureSize; mat4 transform = getTransform(); vec3 vertex = getVertexPosition(transform); vec3 normal = getNormal(transform); vec3 backNormal = normal * -1.0; if (uColorCoding == -2) { float id = floor(aProduct + 0.5); vec4 idColor = getIdColor(id); vFrontColor = idColor; vBackColor = idColor; } else if (uColorCoding >= 0) { float id = float(uColorCoding); vec4 idColor = getIdColor(id); vFrontColor = idColor; vBackColor = idColor; } else { float lightAIntensity = ulightA[3]; vec3 lightADirection = normalize(ulightA.xyz - vertex); float lightBIntensity = ulightB[3]; vec3 lightBDirection = normalize(ulightB.xyz - vertex); float lightWeightA = max(dot(normal, lightADirection) * lightAIntensity, 0.0); float lightWeightB = max(dot(normal, lightBDirection) * lightBIntensity, 0.0); float backLightWeightA = max(dot(backNormal, lightADirection) * lightAIntensity, 0.0); float backLightWeightB = max(dot(backNormal, lightBDirection) * lightBIntensity, 0.0); float lightWeighting = lightWeightA + lightWeightB + 0.4; float backLightWeighting = backLightWeightA + backLightWeightB + 0.4; vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0); if (state == 253) { baseColor = uHighlightColour; } else if (uRenderingMode == 2 || uRenderingMode == 3) { if (state == 252) { baseColor = getColor(); } else { baseColor = vec4(0.0, 0.0, 0.3, 0.5); } } else { baseColor = getColor(); } if (baseColor.a < 0.98 && uRenderingMode == 0) { vec3 trans = -0.002 * uMeter * normalize(normal); vertex = vertex + trans; } vFrontColor = vec4(baseColor.rgb * lightWeighting, baseColor.a); vBackColor = vec4(baseColor.rgb * backLightWeighting, baseColor.a); } vPosition = vertex; gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0); }"