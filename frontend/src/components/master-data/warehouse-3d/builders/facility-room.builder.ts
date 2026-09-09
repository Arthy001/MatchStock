import * as THREE from 'three';
import { FacilityRoom } from '../core/types';

/**
 * Builds Interior Facility Rooms (Restrooms, Offices, Utility & Control Rooms)
 * with partition walls, door frames, and 3D badges.
 */
export class FacilityRoomBuilder {
  /**
   * Builds all rooms in the warehouse layout
   */
  public static buildRooms(rooms: FacilityRoom[], isDark: boolean = true): THREE.Group {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'facility-rooms-root';

    rooms.forEach((room) => {
      const roomGroup = this.buildSingleRoom(room, isDark);
      rootGroup.add(roomGroup);
    });

    return rootGroup;
  }

  /**
   * Builds a single interior room with partition walls and door
   */
  public static buildSingleRoom(room: FacilityRoom, isDark: boolean): THREE.Group {
    const group = new THREE.Group();
    group.name = `room-${room.id}`;
    group.userData = { room, isRoomObstacle: true };

    const wallHeight = room.height || 3.0;
    const wallThickness = 0.18;
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    const doorW = room.doorWidth || 1.3;
    const doorH = 2.2;

    const wallColor = room.wallColor || (isDark ? 0x334155 : 0xe2e8f0);
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.85,
      metalness: 0.05,
    });

    // 1. Back Wall (Solid)
    const backGeo = new THREE.BoxGeometry(room.width, wallHeight, wallThickness);
    const backWall = new THREE.Mesh(backGeo, wallMat);
    backWall.position.set(0, wallHeight / 2, -halfD);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    group.add(backWall);

    // 2. Left Wall (Solid)
    const leftGeo = new THREE.BoxGeometry(wallThickness, wallHeight, room.depth);
    const leftWall = new THREE.Mesh(leftGeo, wallMat);
    leftWall.position.set(-halfW, wallHeight / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // 3. Right Wall (Solid)
    const rightGeo = new THREE.BoxGeometry(wallThickness, wallHeight, room.depth);
    const rightWall = new THREE.Mesh(rightGeo, wallMat);
    rightWall.position.set(halfW, wallHeight / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    group.add(rightWall);

    // 4. Front Wall with Doorway Opening
    // Left segment of front wall
    const leftSegW = (room.width - doorW) / 2;
    if (leftSegW > 0.1) {
      const leftFrontGeo = new THREE.BoxGeometry(leftSegW, wallHeight, wallThickness);
      const leftFront = new THREE.Mesh(leftFrontGeo, wallMat);
      leftFront.position.set(-halfW + leftSegW / 2, wallHeight / 2, halfD);
      leftFront.castShadow = true;
      group.add(leftFront);
    }

    // Right segment of front wall
    const rightSegW = leftSegW;
    if (rightSegW > 0.1) {
      const rightFrontGeo = new THREE.BoxGeometry(rightSegW, wallHeight, wallThickness);
      const rightFront = new THREE.Mesh(rightFrontGeo, wallMat);
      rightFront.position.set(halfW - rightSegW / 2, wallHeight / 2, halfD);
      rightFront.castShadow = true;
      group.add(rightFront);
    }

    // Top lintel above door opening
    const lintelH = wallHeight - doorH;
    if (lintelH > 0.1) {
      const lintelGeo = new THREE.BoxGeometry(doorW, lintelH, wallThickness);
      const lintel = new THREE.Mesh(lintelGeo, wallMat);
      lintel.position.set(0, doorH + lintelH / 2, halfD);
      lintel.castShadow = true;
      group.add(lintel);
    }

    // 5. Door Frame (Industrial Dark Metal)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.4,
    });
    const postGeo = new THREE.BoxGeometry(0.08, doorH, wallThickness + 0.04);
    const leftPost = new THREE.Mesh(postGeo, frameMat);
    leftPost.position.set(-doorW / 2, doorH / 2, halfD);
    group.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, frameMat);
    rightPost.position.set(doorW / 2, doorH / 2, halfD);
    group.add(rightPost);

    // 6. Room Floor Mat / Indicator Tile
    const floorGeo = new THREE.PlaneGeometry(room.width - 0.1, room.depth - 0.1);
    const floorMat = new THREE.MeshBasicMaterial({
      color: room.floorColor || (room.type === 'restroom' ? 0x0284c7 : 0x475569),
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const roomFloor = new THREE.Mesh(floorGeo, floorMat);
    roomFloor.rotation.x = -Math.PI / 2;
    roomFloor.position.set(0, 0.02, 0);
    group.add(roomFloor);

    // 7. 3D Badge Signboard above Door
    const badgeGroup = this.createRoomBadge(room);
    badgeGroup.position.set(0, doorH + 0.45, halfD + 0.12);
    group.add(badgeGroup);

    // Position room group at world coordinates
    group.position.set(room.x, 0, room.z);
    return group;
  }

  /**
   * Creates an official high-contrast Canvas Texture Badge for the room
   */
  private static createRoomBadge(room: FacilityRoom): THREE.Group {
    const badgeGroup = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Rounded Card Background
      const isRestroom = room.type === 'restroom';
      const bgColor = isRestroom ? '#0369a1' : room.type === 'office' ? '#4338ca' : '#334155';
      const borderColor = isRestroom ? '#38bdf8' : room.type === 'office' ? '#818cf8' : '#94a3b8';

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 140, 24);
      ctx.fill();

      ctx.lineWidth = 6;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      // Icon + Title Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      const icon = isRestroom ? '🚻' : room.type === 'office' ? '💼' : '⚡';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(`${icon} ${room.label.toUpperCase()}`, 256, 60);

      // Subtitle
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = borderColor;
      ctx.fillText(room.name, 256, 108);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const signGeo = new THREE.PlaneGeometry(1.8, 0.55);
    const signMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    badgeGroup.add(signMesh);

    return badgeGroup;
  }
}
