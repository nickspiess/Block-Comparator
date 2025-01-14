"use client";
import * as THREE from 'three';
import '../styles/globals.css';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useSpring, animated } from '@react-spring/three';
import { Text } from '@react-three/drei';


function BlockCountDisplay({ count, position }) {
  const textProps = useMemo(() => ({
    color: "white",
    fontSize: 1.8,
    anchorX: "center",
    anchorY: "middle",
    font: '/fonts/frostbite.ttf', // Make sure this font is available
    outlineWidth: 0,
    outlineColor: "#57beff4d",
    outlineOpacity: 0.5,
  }), []);

  // Create multiple text elements for glow effect
  return (
    <group position={[position[0], position[1] - 6, position[2]]}>
      {/* Outer glow layers */}
      <Text {...textProps} fillOpacity={0.1} position={[0, 0, -0.3]}>
        {count}
      </Text>
      <Text {...textProps} fillOpacity={0.1} position={[0, 0, -0.2]}>
        {count}
      </Text>
      <Text {...textProps} fillOpacity={0.15} position={[0, 0, -0.1]}>
        {count}
      </Text>
      
      {/* Main text */}
      <Text {...textProps} fillOpacity={0.9}>
        {count}
      </Text>
      
      {/* Inner glow */}
      <Text {...textProps} fillOpacity={0.3} position={[0, 0, 0.1]}>
        {count}
      </Text>
    </group>
  );
}

function ComparisonAnimation({ leftCount, rightCount, show }) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [messageOpacity, setMessageOpacity] = useState(0);
  const springs = useSpring({
    scale: show ? 1 : 0,
    opacity: show ? 1 : 0,
    config: {
      mass: 1,
      tension: 120,
      friction: 14
    }
  });

  useEffect(() => {
    if (show) {
      // Delay the message appearance until after the symbol animation
      const timer = setTimeout(() => {
        setAnimationComplete(true);
        setMessageOpacity(1);
      }, 2000); // Adjust timing as needed
      return () => clearTimeout(timer);
    } else {
      setAnimationComplete(false);
      setMessageOpacity(0);
    }
  }, [show]);

  const getComparisonData = () => {
    if (leftCount > rightCount) {
      return {
        symbol: '>',
        message: `${leftCount} is greater than ${rightCount}. This means the left stack has more blocks than the right stack. We can see this by counting and comparing the number of blocks in each stack!`
      };
    } else if (leftCount < rightCount) {
      return {
        symbol: '<',
        message: `${leftCount} is less than ${rightCount}. This means the left stack has fewer blocks than the right stack. We can compare the stacks by counting the blocks in each one!`
      };
    } else {
      return {
        symbol: '=',
        message: `${leftCount} equals ${rightCount}. Both stacks have the same number of blocks. We can verify this by counting the blocks in each stack!`
      };
    }
  };

  const { symbol, message } = getComparisonData();

  return (
    <group>
      <animated.group scale={springs.scale} position={[0, BASE_Y_POSITION, 0]}>
        {/* Animated symbol drawing */}
        <Text
          color="white"
          fontSize={3}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#8becff"
          outlineOpacity={0.5}
        >
          {symbol}
        </Text>
        
        {/* Glow effects */}
        {[0.2, 0.4, 0.6].map((offset, idx) => (
          <Text
            key={idx}
            color="white"
            fontSize={3}
            anchorX="center"
            anchorY="middle"
            position={[0, 0, -offset]}
            fillOpacity={0.2}
          >
            {symbol}
          </Text>
        ))}
      </animated.group>

      {/* Educational message */}
      {animationComplete && (
        <group position={[0, BASE_Y_POSITION - 5, 0]}>
          <Text
            color="white"
            fontSize={1}
            maxWidth={20}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#8becff"
            outlineOpacity={0.3}
            fillOpacity={messageOpacity}
            textAlign="center"
          >
            {message}
          </Text>
        </group>
      )}
    </group>
  );
}


function InstructionMessage({ mode, onClose }) {
  if (!mode || (mode !== 'add' && mode !== 'draw')) return null;

  const messages = {
    add: {
      title: "Block Transfer Mode Activated!",
      content: [
        "You can now click and drag blocks between the stacks.",
        "Try moving a block from one stack area to another!"
      ]
    },
    draw: {
      title: "Comparison Mode Activated!",
      content: [
        "Click on the top or bottom of a stack to start drawing a comparison line.",
        "Draw to the same position (top-to-top or bottom-to-bottom) on the other stack to make a comparison.",
        "Try comparing the different parts of your stacks!"
      ]
    }
  };

  const currentMessage = messages[mode];

  return (
    <div className="instruction-message">
      <div className="instruction-content">
        <h3>{currentMessage.title}</h3>
        {currentMessage.content.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
        <button className="close-button" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

 function ComparisonFeedback({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="instruction-message">
      <div className="instruction-content">
        <h3>Drawing Hint</h3>
        <p>{message}</p>
        <button className="close-button" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

function DropZoneText({ isActive }) {
  const springs = useSpring({
    scale: isActive ? 1 : 0,
    opacity: isActive ? 0.9 : 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });

  return (
    <animated.group scale={springs.scale} position={[0, 3, 0]}>
      <Text
        color="white"
        fontSize={1.2}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#db2c2c"
        outlineOpacity={0.5}
      >
        Drop Here To Remove Block!
      </Text>
    </animated.group>
  );
}

function ComparisonLine({ start, end, inProgress = false }) {
  const points = [
    new THREE.Vector3(start[0], start[1], 0.5),
    new THREE.Vector3(end[0], end[1], 0.5)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Increased base opacity and more consistent material
  const mainMaterial = useMemo(() => new THREE.LineBasicMaterial({ 
    color: 0x8becff,
    transparent: true,
    opacity: inProgress ? 0.8 : 1.0,  // Increased opacity
    linewidth: 3  // Increased from 2
  }), [inProgress]);

  // Many more offset lines with larger spread for much thicker appearance
  const offsets = [
    -0.4, -0.35, -0.3, -0.25, -0.2, -0.15, -0.1, -0.05,
    0,
    0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4
  ];

  return (
    <group renderOrder={1}>
      {offsets.map((offset, idx) => (
        <line
          key={idx}
          geometry={new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(start[0], start[1], 0.5 + offset),
            new THREE.Vector3(end[0], end[1], 0.5 + offset)
          ])}
          material={mainMaterial}
        />
      ))}
      {/* Add horizontal offset lines for extra thickness */}
      {offsets.map((offset, idx) => (
        <line
          key={`h-${idx}`}
          geometry={new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(start[0] + offset/3, start[1], 0.5),
            new THREE.Vector3(end[0] + offset/3, end[1], 0.5)
          ])}
          material={mainMaterial}
        />
      ))}
    </group>
  );
}

const BASE_Y_POSITION = 5;

function DropZone({ isActive }) {
  const width = 18;
  const height = 34;
  const yOffset = height/4;

  const springs = useSpring({
    scale: isActive ? 1 : 0,
    opacity: isActive ? 0.15 : 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });

  return (
    <group>
      <animated.mesh
        position={[0, BASE_Y_POSITION + yOffset, -0.25]}
        renderOrder={-2}
        scale={springs.scale}
      >
        <planeGeometry args={[width, height]} />
        <animated.meshBasicMaterial
          color="#db2c2c"
          transparent={true}
          opacity={springs.opacity}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </animated.mesh>
      <DropZoneText isActive={isActive} />
    </group>
  );
}


function Cube({ 
  position = [0, 0, 0], 
  index, 
  show, 
  onDrop = () => {}, 
  interactionMode,
  onDragStart = () => {},
  onDragEnd = () => {}
}){
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPlane, setDragPlane] = useState(null);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  const { camera, raycaster, pointer } = useThree();

  const springs = useSpring({
    from: { 
      scale: [0, 0, 0], 
      position: [position[0], position[1] - 2, position[2]], 
      opacity: 0 
    },
    to: { 
      scale: show ? [1, 1, 1] : [0, 0, 0], 
      position: show ? position : [position[0], position[1] - 2, position[2]], 
      opacity: show ? 1 : 0 
    },
    config: show 
      ? { mass: 1, tension: 220, friction: 14 }
      : { mass: 1, tension: 180, friction: 12 },
    delay: 0,
  });

  useFrame(() => {
    if (isDragging && meshRef.current && dragPlane) {
      raycaster.setFromCamera(pointer, camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, intersection);
      
      meshRef.current.position.copy(intersection.sub(dragOffset));
    }
  });

  const handlePointerDown = (e) => {

    if (interactionMode !== 'add') return;

    e.stopPropagation();
    setIsDragging(true);
    onDragStart();
    
    // Create a plane parallel to the camera
    const planeNormal = new THREE.Vector3(0, 0, 1);
    const planePosition = new THREE.Vector3(position[0], position[1], position[2]);
    setDragPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(
      planeNormal,
      planePosition
    ));
    
    // Calculate drag offset
    raycaster.setFromCamera(pointer, camera);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(
      new THREE.Plane().setFromNormalAndCoplanarPoint(
        planeNormal,
        planePosition
      ),
      intersection
    );
    
    setDragOffset(intersection.sub(new THREE.Vector3(position[0], position[1], position[2])));
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    setIsDragging(false);
    setDragPlane(null);
    onDragEnd();
    
    if (meshRef.current) {
      const finalPosition = [
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      ];
      
      onDrop(finalPosition);
      meshRef.current.position.set(position[0], position[1], position[2]);
    }
    
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <animated.mesh 
      ref={meshRef}
      rotation={[0.5, 3.9, 0]} 
      scale={springs.scale} 
      position={isDragging ? meshRef.current?.position : springs.position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ cursor: interactionMode === 'add' ? 'grab' : 'default' }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <animated.meshBasicMaterial attach="material-0" color="#b7f4ef" transparent opacity={springs.opacity} />
      <animated.meshBasicMaterial attach="material-1" color="#117bbc" transparent opacity={springs.opacity} />
      <animated.meshBasicMaterial attach="material-2" color="#5ed2e5" transparent opacity={springs.opacity} />
      <animated.meshBasicMaterial attach="material-3" color="#b7f4ef" transparent opacity={springs.opacity} />
      <animated.meshBasicMaterial attach="material-4" color="#117bbc" transparent opacity={springs.opacity} />
      <animated.meshBasicMaterial attach="material-5" color="#117bbc" transparent opacity={springs.opacity} />
    </animated.mesh>
  );
}


function StackClickZone({ position, type, blockCount, isActive }) {
  const width = 2;
  const height = 1.5;
  const emptyStackSpacing = 1.5;
  
  const spacing = 1.2;
  const baseY = BASE_Y_POSITION;
  
  let yOffset;
  if (blockCount === 0) {
    yOffset = type === 'top' 
      ? baseY + emptyStackSpacing
      : baseY - emptyStackSpacing;
  } else {
    const maxBlocks = 10;
    const adjustedCount = Math.min(blockCount, maxBlocks);
    const topBlockPosition = baseY + ((adjustedCount - 1) * spacing / 2);
    const bottomBlockPosition = baseY - ((adjustedCount - 1) * spacing / 2);
    
    // Make offsets consistent with getClickZone
    const topOffset = 1;    // Reduced from 2
    const bottomOffset = 1; // Made equal to top
    
    yOffset = type === 'top' 
      ? topBlockPosition + topOffset
      : bottomBlockPosition - bottomOffset;
  }

  return (
    <mesh
      position={[position[0], yOffset, 0]}
      renderOrder={1}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        color="#3dcc47"
        transparent
        opacity={isActive ? 0.7 : 0.5}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}


function StackBackground({ position }) {
  const FIXED_HEIGHT = 38; // Fixed height for all stack backgrounds
  const WIDTH = 10;

  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1;
    
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    
    gradient.addColorStop(0, 'hsla(203, 78%, 18%, 1)');
    gradient.addColorStop(0.3, 'hsla(211, 24%, 49%, 1)');
    gradient.addColorStop(0.7, 'hsla(211, 24%, 49%, 1)');
    gradient.addColorStop(1, 'hsla(203, 78%, 18%, 1)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <mesh 
      position={[position[0], position[1] + (FIXED_HEIGHT/4), position[2] - 0.5]} 
      renderOrder={-1}
    >
      <planeGeometry args={[WIDTH, FIXED_HEIGHT]} />
      <meshBasicMaterial 
        map={gradientTexture}
        transparent={true}
        opacity={0.7}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function BlockStack({ 
  count, 
  position = [0, BASE_Y_POSITION, 0], 
  stackId, 
  onBlockTransfer = () => {}, 
  onOutOfBounds = () => {}, 
  interactionMode,
  onDragStart = () => {},
  onDragEnd = () => {},
  maxStackCount = 0 
}) {
  const [positions, setPositions] = useState(['center']);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [lastAction, setLastAction] = useState(null);  // Add this back
  const [lastAddedPosition, setLastAddedPosition] = useState('top');
  const [blocks, setBlocks] = useState([]);

  const handleBlockDrop = (dropPosition) => {
    if (onOutOfBounds(stackId, dropPosition)) {
      setLastAction('drag');  // Add this to handle removal animation
      return;
    }
    
    const isLeftStack = dropPosition[0] < 0;
    const targetStackId = isLeftStack ? 'left' : 'right';
    
    if (targetStackId !== stackId) {
      setLastAction('drag');
      onBlockTransfer(stackId, targetStackId);
    }
  };

  const calculateBlockPositions = useMemo(() => (blockArray) => {
    // Base spacing is now calculated based on max stack count
    const maxSpacing = 1.8; // Maximum spacing when few blocks
    const minSpacing = 1.1; // Minimum spacing when many blocks
    const maxBlocks = 10;   // Maximum possible blocks
    
    // Calculate dynamic spacing based on largest stack
    const spacing = Math.max(
      minSpacing,
      maxSpacing * (1 - (maxStackCount / maxBlocks) * 1)
    );
    
    const centerY = position[1];
    
    // If it's the first block being added to an empty stack, force center position
    if (blockArray.length === 1 && isFirstRender) {
      setIsFirstRender(false);
      return [{
        ...blockArray[0],
        renderPosition: [position[0], centerY, position[2]],
        positionType: 'center'
      }];
    }
    
    return blockArray.map((block, index) => {
      const positionType = positions[index] || 'center';
      let yPosition = centerY;
      
      if (positionType === 'top') {
        const topIndex = positions.slice(0, index).filter(p => p === 'top').length;
        yPosition = centerY + ((topIndex + 1) * spacing);
      } else if (positionType === 'bottom') {
        const bottomIndex = positions.slice(0, index).filter(p => p === 'bottom').length;
        yPosition = centerY - ((bottomIndex + 1) * spacing);
      }
      
      return {
        ...block,
        renderPosition: [position[0], yPosition, position[2]],
        positionType
      };
    });
  }, [position, positions, isFirstRender, maxStackCount]);


  // Initialize blocks on mount
  useEffect(() => {
    const initialBlocks = Array.from({ length: count }, (_, i) => ({
      id: `${stackId}-initial-${i}-${Math.random()}`,
      show: true,
      isDragged: false
    }));
    setBlocks(calculateBlockPositions(initialBlocks));
  }, []); // Empty dependency array for initialization

  // Reset positions when stack becomes empty
  useEffect(() => {
    if (count === 0) {
      setPositions(['center']);
      setIsFirstRender(true);
    }
  }, [count]);

  // Handle count changes
  useEffect(() => {
    if (count > blocks.length) {
      const newPositions = [...positions];
      const blocksToAdd = count - blocks.length;
      
      if (blocks.length === 0) {
        newPositions[0] = 'center';
        if (blocksToAdd > 1) {
          for (let i = 1; i < blocksToAdd; i++) {
            newPositions.push(i % 2 === 1 ? 'top' : 'bottom');
          }
        }
      } else {
        for (let i = 0; i < blocksToAdd; i++) {
          const lastPos = newPositions[newPositions.length - 1];
          if (lastPos === 'center') {
            newPositions.push('top');
          } else if (lastPos === 'top') {
            newPositions.push('bottom');
          } else {
            newPositions.push('top');
          }
        }
      }
      
      setPositions(newPositions);
      
      const newBlocks = Array.from({ length: blocksToAdd }, (_, i) => ({
        id: `${stackId}-${blocks.length + i}-${Math.random()}`,
        show: true,
        isDragged: false
      }));
      
      setBlocks(prevBlocks => calculateBlockPositions([...prevBlocks, ...newBlocks]));
      
    } else if (count < blocks.length) {
      const newPositions = positions.slice(0, count);
      setPositions(newPositions);
      
      const blocksToKeep = blocks.slice(0, count);
      setBlocks(calculateBlockPositions(blocksToKeep));
    }
  }, [count, stackId, calculateBlockPositions, blocks.length, positions]);

  // Force position recalculation on resize
  useEffect(() => {
    if (blocks.length > 0) {
      setBlocks(prevBlocks => calculateBlockPositions([...prevBlocks]));
    }
  }, [position, calculateBlockPositions]);


  return (
    <group>
      <StackBackground position={position} />
      {blocks.map((block) => (
        <Cube 
        key={block.id} 
        position={block.renderPosition}
        index={blocks.indexOf(block)}
        show={block.show}
        onDrop={handleBlockDrop}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        stackId={stackId}
        interactionMode={interactionMode}
        />
      ))}
    </group>
  );
}

function Scene({ leftCount, rightCount, onBlockTransfer, interactionMode, onBlockRemove, onFeedback, showComparison, setShowComparison }) {
  const [drawingLine, setDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);
  const [completedLines, setCompletedLines] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartStack, setDragStartStack] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const { camera, raycaster, pointer } = useThree();

  const maxStackCount = Math.max(leftCount, rightCount)


  // Clear lines when mode changes
  useEffect(() => {
    if (interactionMode !== 'draw') {
      setCompletedLines([]);
      setCurrentLine(null);
      setDrawingLine(false);
      setLineStart(null);
    }
  }, [interactionMode]);

  useEffect(() => {
    if (interactionMode == 'draw') {
      setCompletedLines([]);
      setCurrentLine(null);
      setDrawingLine(false);
      setLineStart(null);
    }
  }, [leftCount, rightCount]);

  useEffect(() => {
    if (showComparison) {
      setShowComparison(false);
    }
  }, [interactionMode]);

  useEffect(() => {
    if (showComparison) {
      // Clear all drawing states immediately
      setDrawingLine(false);
      setLineStart(null);
      setCurrentLine(null);
      setCompletedLines([]);
    }
  }, [showComparison, interactionMode]);

  const handleDragStart = (stackId) => {
    setIsDragging(true);
    setDragStartStack(stackId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartStack(null);
  };

  const hasExistingLineAtPosition = (stack, position) => {
    return completedLines.some(line => {
      // Check if either end of any existing line connects to this position
      const isStart = line.start[0] === (stack === 'left' ? -14 : 14) && 
                     Math.abs(line.start[1] - position) < 0.1;
      const isEnd = line.end[0] === (stack === 'left' ? -14 : 14) && 
                   Math.abs(line.end[1] - position) < 0.1;
      return isStart || isEnd;
    });
  };

  // Click zone calculation with block-relative positioning
  const getClickZone = useCallback((point) => {
    const spacing = 1.2;
    const baseY = BASE_Y_POSITION;
    const emptyStackSpacing = 1.5;
    
    const calculateZones = (count) => {
      if (count === 0) {
        return {
          top: baseY + emptyStackSpacing,
          bottom: baseY - emptyStackSpacing
        };
      }
      
      const maxBlocks = 10;
      const topBlockY = baseY + Math.min((count - 1), maxBlocks - 1) * (spacing / 2);
      const bottomBlockY = baseY - Math.min((count - 1), maxBlocks - 1) * (spacing / 2);
      
      // Adjust offsets to be more balanced
      const topOffset = 1;    // Reduced from 2
      const bottomOffset = 1; // Made equal to top
      
      return {
        top: topBlockY + topOffset,
        bottom: bottomBlockY - bottomOffset
      };
    };
  
    const tolerance = 3;
    const xTolerance = 8;
  
    // Left stack check
    if (Math.abs(point.x - (-14)) < xTolerance) {
      const zones = calculateZones(leftCount);
      const bottomDist = Math.abs(point.y - zones.bottom);
      const topDist = Math.abs(point.y - zones.top);
      
      if (bottomDist < tolerance || topDist < tolerance) {
        return {
          stack: 'left',
          position: bottomDist < topDist ? 'bottom' : 'top',
          y: bottomDist < topDist ? zones.bottom : zones.top
        };
      }
    }
    
    // Right stack check
    if (Math.abs(point.x - 14) < xTolerance) {
      const zones = calculateZones(rightCount);
      const bottomDist = Math.abs(point.y - zones.bottom);
      const topDist = Math.abs(point.y - zones.top);
      
      if (bottomDist < tolerance || topDist < tolerance) {
        return {
          stack: 'right',
          position: bottomDist < topDist ? 'bottom' : 'top',
          y: bottomDist < topDist ? zones.bottom : zones.top
        };
      }
    }
    
    return null;
  }, [leftCount, rightCount]);
  
  

  

  const isWithinDropZone = (point) => {
    const centerZone = {
      minX: -9,
      maxX: 9,
      minY: -14,
      maxY: 20
    };
    return point[0] >= centerZone.minX && point[0] <= centerZone.maxX &&
           point[1] >= centerZone.minY && point[1] <= centerZone.maxY;
  };

  const isWithinStackZone = (point, isLeft) => {
    const stackX = isLeft ? -14 : 14;
    const xBound = 5;
    const yBound = 17;
    return Math.abs(point[0] - stackX) < xBound && Math.abs(point[1]) < yBound;
  };

  const handleOutOfBounds = (stackId, position) => {
    const isInLeftStack = isWithinStackZone(position, true);
    const isInRightStack = isWithinStackZone(position, false);
    const isInDropZone = isWithinDropZone(position);

    if ((stackId === 'left' && isInRightStack) || 
        (stackId === 'right' && isInLeftStack)) {
      return false;
    }

    if (isInDropZone || (!isInLeftStack && !isInRightStack)) {
      onBlockRemove(stackId);
      return true;
    }

    return false;
  };


  const handlePointerDown = () => {
    if (interactionMode !== 'draw') return;
  
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
  
    const zone = getClickZone(intersection);
    
    if (!zone) {
      onFeedback("Click on the highlighted areas to start drawing a comparison!");
      return;
    }
  
    // Check if trying to start a line from a position that already has a line
    if (!lineStart && hasExistingLineAtPosition(zone.stack, zone.y)) {
      onFeedback("This position already has a comparison line!");
      return;
    }
  
    // Check if trying to end a line at a position that already has a line
    if (lineStart && hasExistingLineAtPosition(zone.stack, zone.y)) {
      onFeedback("This position already has a comparison line!");
      setDrawingLine(false);
      setLineStart(null);
      setCurrentLine(null);
      return;
    }
  
    onFeedback(null);
  
    if (!lineStart) {
      const startPoint = [zone.stack === 'left' ? -14 : 14, zone.y, 0];
      setDrawingLine(true);
      setLineStart(startPoint);
      setCurrentLine([
        startPoint,
        [intersection.x, intersection.y, 0]
      ]);
    } else {
      const startZone = getClickZone(new THREE.Vector3(lineStart[0], lineStart[1], 0));
      
      if (startZone && startZone.position === zone.position && startZone.stack !== zone.stack) {
        setCompletedLines(prev => [...prev, {
          start: lineStart,
          end: [zone.stack === 'left' ? -14 : 14, zone.y, 0]
        }]);
        onFeedback(null);
      } else if (startZone && startZone.position !== zone.position) {
        onFeedback("Make sure to connect top to top or bottom to bottom!");
      } else {
        onFeedback("Try clicking on a highlighted area on the other stack!");
      }
      setDrawingLine(false);
      setLineStart(null);
      setCurrentLine(null);
    }
  };

  const handlePointerMove = () => {
    if (interactionMode !== 'draw') return;
  
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
  
    const zone = getClickZone(intersection);
    setHoveredZone(zone);
  
    // Update the line position while drawing
    if (drawingLine && lineStart) {
      if (zone) {
        // Snap to zone if hovering over valid zone
        const endX = zone.stack === 'left' ? -14 : 14;
        setCurrentLine([
          lineStart,
          [endX, zone.y, 0]
        ]);
      } else {
        // Follow cursor exactly, maintaining z-position
        setCurrentLine([
          lineStart,
          [intersection.x, intersection.y, 0]
        ]);
      }
    }
  };

  useFrame(() => {
    if (drawingLine && lineStart) {
      raycaster.setFromCamera(pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      setCurrentLine([
        lineStart,
        [intersection.x, intersection.y, 0]
      ]);
    }
  });

  

  // Inside Scene component's return statement
return (
  <>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} intensity={0.8} />

    {/* Invisible interaction plane */}
    {interactionMode === 'draw' && (
      <mesh 
        position={[0, 0, 1]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial visible={false} transparent opacity={0} />
      </mesh>
    )}

    {/* Click zones for drawing mode */}
    {interactionMode === 'draw' && (
      <>
        <StackClickZone 
          position={[-14, BASE_Y_POSITION, 0]} 
          type="top"
          blockCount={leftCount}
          isActive={hoveredZone?.stack === 'left' && hoveredZone?.position === 'top'} 
        />
        <StackClickZone 
          position={[-14, BASE_Y_POSITION, 0]} 
          type="bottom"
          blockCount={leftCount}
          isActive={hoveredZone?.stack === 'left' && hoveredZone?.position === 'bottom'} 
        />
        
        {/* Right stack zones */}
        <StackClickZone 
          position={[14, BASE_Y_POSITION, 0]} 
          type="top"
          blockCount={rightCount}
          isActive={hoveredZone?.stack === 'right' && hoveredZone?.position === 'top'} 
        />
        <StackClickZone 
          position={[14, BASE_Y_POSITION, 0]} 
          type="bottom"
          blockCount={rightCount}
          isActive={hoveredZone?.stack === 'right' && hoveredZone?.position === 'bottom'} 
        />
      </>
    )}


    {interactionMode === 'draw' && (
      <mesh 
        position={[0, 0, 1]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial visible={false} transparent opacity={0} />
      </mesh>
    )}

    {/* Block stacks */}
    <BlockStack 
      count={leftCount} 
      position={[-14, BASE_Y_POSITION, 0]} 
      stackId="left"
      onBlockTransfer={onBlockTransfer}
      onOutOfBounds={handleOutOfBounds}
      onDragStart={() => handleDragStart('left')}
      onDragEnd={handleDragEnd}
      interactionMode={interactionMode}
      maxStackCount={maxStackCount}
    />
    <BlockStack 
      count={rightCount} 
      position={[14, BASE_Y_POSITION, 0]} 
      stackId="right"
      onBlockTransfer={onBlockTransfer}
      onOutOfBounds={handleOutOfBounds}
      onDragStart={() => handleDragStart('right')}
      onDragEnd={handleDragEnd}
      interactionMode={interactionMode}
      maxStackCount={maxStackCount}
    />

    
    <ComparisonAnimation 
      leftCount={leftCount}
      rightCount={rightCount}
      show={showComparison}
    />


    {/* Comparison lines */}
    {completedLines.map((line, i) => (
        <ComparisonLine 
          key={`completed-${i}`} 
          start={line.start} 
          end={line.end} 
        />
      ))}
      {currentLine && drawingLine && (
        <ComparisonLine 
          start={currentLine[0]} 
          end={currentLine[1]} 
          inProgress={true} 
        />
      )}

      <BlockCountDisplay 
        count={leftCount}
        position={[-14, BASE_Y_POSITION - 1.3, 0]}
      />
      <BlockCountDisplay 
        count={rightCount}
        position={[14, BASE_Y_POSITION - 1.5, 0]}
      />

  </>
);
}



export default function Home() {
  const [leftStackCount, setleftStackCount] = useState(1);
  const [rightStackCount, setrightStackCount] = useState(1);
  const [activeMode, setActiveMode] = useState('off');
  const [totalBlockCount, setTotalBlockCount] = useState(2);
  const [showInstructions, setShowInstructions] = useState(false);
  const [comparisonFeedback, setComparisonFeedback] = useState(null);
  const [showComparison, setShowComparison] = useState(false);


  const handleCompareClick = () => {
    // First turn off interactive modes
    setActiveMode('off');
    // Small delay to ensure mode change is processed
    requestAnimationFrame(() => {
      setShowComparison(true);
    });
  };

  const handleClearComparison = () => {
    setShowComparison(false);
  };



  const handleBlockRemove = (stackId) => {
    if (stackId === 'left') {
      setleftStackCount(prev => Math.max(0, prev - 1));
    } else {
      setrightStackCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    // Show instructions for both 'add' and 'draw' modes
    if (mode === 'add' || mode === 'draw') {
      setShowInstructions(true);
    }
    // Clear any existing feedback when mode changes
    setComparisonFeedback(null);
  };

  const handleBlockTransfer = (fromStackId, toStackId) => {
    if (fromStackId === 'left' && toStackId === 'right') {
      setleftStackCount(prev => Math.max(0, prev - 1));
      setrightStackCount(prev => prev + 1);
    } else if (fromStackId === 'right' && toStackId === 'left') {
      setrightStackCount(prev => Math.max(0, prev - 1));
      setleftStackCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    setTotalBlockCount(leftStackCount + rightStackCount);
  }, [leftStackCount, rightStackCount]);

  const handleTotalIncrement = () => {
    if (totalBlockCount < 10) {
      setTotalBlockCount(totalBlockCount + 1);
      setleftStackCount(leftStackCount + 1);
    }
  };
  
  const handleTotalDecrement = () => {
    if (totalBlockCount > 0) {
      setTotalBlockCount(totalBlockCount - 1);
      setleftStackCount(Math.max(0, leftStackCount - 1));
    }
  };

  const handleLeftIncrement = () => {
    if (totalBlockCount < 10) {
      setleftStackCount(leftStackCount + 1);
    }
  };

  const handleLeftDecrement = () => {
    if (leftStackCount > 0) {
      setleftStackCount(leftStackCount - 1);
    }
  };

  const handleRightIncrement = () => {
    if (totalBlockCount < 10) {
      setrightStackCount(rightStackCount + 1);
    }
  };

  const handleRightDecrement = () => {
    if (rightStackCount > 0) {
      setrightStackCount(rightStackCount - 1);
    }
  };

  return (
    <div className="main-container">
      {showInstructions && (
        <InstructionMessage 
          mode={activeMode} 
          onClose={() => setShowInstructions(false)}
        />
      )}
      {comparisonFeedback && (
        <ComparisonFeedback 
          message={comparisonFeedback}
          onClose={() => {
            setComparisonFeedback(null);
            if (activeMode === 'draw') {
              setShowInstructions(false);
            }
          }}
        />
      )}

      <section className="stack-container">
      <section className="header-container">
        <header className="main-header font-custom">Block Comparator</header>
      </section>
      <div className="stack" style={{ 
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
    }}>
      <div className='gradient'>
      <Canvas
        camera={{
          position: [0, 7, 35],
          fov: 35,
          up: [0, 0, 0]
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <Scene 
          leftCount={leftStackCount} 
          rightCount={rightStackCount}
          onBlockTransfer={handleBlockTransfer}
          onBlockRemove={handleBlockRemove} 
          interactionMode={activeMode}
          onFeedback={(message) => {
            setComparisonFeedback(message);
          }}
          showComparison={showComparison}
          setShowComparison={setShowComparison}
        />
      </Canvas>
        </div>
      </div>
      </section>

      <div className="control-panel">
        <div className="widget-state">
          <header className="font-custom widget-header">Current Count Details</header>

          <section className="widget-state-container">
            <section className="stack-widget-section">
              <div className="state-count-container">
                <header className="widget-sub-header">
                  Left Stack<br/>Count:
                </header>
                <div className="count-container">
                  <button 
                    onClick={handleLeftDecrement} 
                    className="count-change"
                    disabled={leftStackCount <= 0}
                  > - </button>
                  <p className="count font-custom">{leftStackCount}</p>
                  <button 
                    onClick={handleLeftIncrement} 
                    className="count-change"
                    disabled={totalBlockCount >= 10}
                  > + </button>
                </div>
              </div>

              <div className="state-count-container">
                <header className="widget-sub-header">
                  Right Stack<br/>Count:
                </header>
                <div className="count-container">
                  <button 
                    onClick={handleRightDecrement} 
                    className="count-change"
                    disabled={rightStackCount <= 0}
                  > - </button>
                  <p className="count font-custom">{rightStackCount}</p>
                  <button 
                    onClick={handleRightIncrement} 
                    className="count-change"
                    disabled={totalBlockCount >= 10}
                  > + </button>
                </div>
              </div>

              <section className="count-widget-section">
                <div className="widget-count-container">
                  <header className="widget-sub-header">
                    Total Block<br/>Count:
                  </header>
                  <div className="count-container">
                    <button 
                      onClick={handleTotalDecrement} 
                      className="count-change"
                      disabled={totalBlockCount <= 0}
                    > - </button>
                    <p className="count font-custom">{totalBlockCount}</p>
                    <button 
                      onClick={handleTotalIncrement} 
                      className="count-change"
                      disabled={totalBlockCount >= 10}
                    > + </button>
                  </div>
                </div>
              </section>
            </section>
          </section>
        </div>

        <div className="interaction-mode">
          <header className="interaction-header font-custom">Interaction Mode</header>
          <div className="button-container">
            <button 
              className={`button ${activeMode === 'off' ? 'active' : ''}`} 
              onClick={() => handleModeChange('off')}
            >Off
            </button>
            <button 
              className={`button ${activeMode === 'draw' ? 'active' : ''}`} 
              onClick={() => handleModeChange('draw')}
            >
              Draw and Compare!
            </button>
            <button 
              className={`button ${activeMode === 'add' ? 'active' : ''}`} 
              onClick={() => handleModeChange('add')}
            >
              Add or Remove!
            </button>
          </div>
        </div>

        <div className="interaction-mode">
          <button 
            className="comparison-button button"
            onClick={handleCompareClick}
          >
          Let's Compare!
          </button>
          <button 
            onClick={handleClearComparison}
            className={`clear-comparison-button ${!showComparison ? 'disabled' : ''}`}
            disabled={!showComparison}
          >
            Clear Comparison
          </button>
        </div>
      </div>
    </div>
  );
}