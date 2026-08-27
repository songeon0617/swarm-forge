import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/balance';
import type { UpgradeLevels } from '../survivalTypes';
import type { UpgradeChoice } from '../upgrades/SurvivalUpgradeSystem';

export function createUpgradeOverlay(
  scene: Phaser.Scene,
  playerLevel: number,
  levels: UpgradeLevels,
  choices: UpgradeChoice[],
  onSelect: (choice: UpgradeChoice) => void,
): Phaser.GameObjects.Container {
  let selectionLocked = false;
  const overlay = scene.add.container(0, 0).setDepth(150);
  overlay.add(
    scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x01040c, 0.9).setInteractive(),
  );
  overlay.add(
    scene.add
      .text(GAME_WIDTH / 2, 124, `LEVEL ${playerLevel}`, {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: '#baffff',
        stroke: '#05657a',
        strokeThickness: 4,
      })
      .setOrigin(0.5),
  );
  overlay.add(
    scene.add
      .text(GAME_WIDTH / 2, 161, 'CHOOSE ONE UPGRADE', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '12px',
        color: '#7eddea',
      })
      .setOrigin(0.5)
      .setLetterSpacing(2),
  );
  choices.forEach((choice, index) => {
    const card = createCard(scene, choice, levels, 262 + index * 145);
    card.getByName('hitArea')?.once('pointerdown', () => {
      if (selectionLocked) return;
      selectionLocked = true;
      onSelect(choice);
    });
    overlay.add(card);
  });
  return overlay;
}

function createCard(
  scene: Phaser.Scene,
  choice: UpgradeChoice,
  levels: UpgradeLevels,
  y: number,
): Phaser.GameObjects.Container {
  const card = scene.add.container(GAME_WIDTH / 2, y);
  const body = scene.add
    .rectangle(0, 0, 332, 112, 0x081a2c, 0.98)
    .setName('hitArea')
    .setStrokeStyle(2, 0x3cefff, 0.9)
    .setInteractive({ useHandCursor: true });
  const title = scene.add
    .text(-142, -31, choice.title, { fontFamily: 'Arial Black', fontSize: '17px', color: '#ffffff' })
    .setOrigin(0, 0.5);
  const description = scene.add
    .text(-142, 5, choice.description, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      color: '#8de8f4',
    })
    .setOrigin(0, 0.5);
  const level = scene.add
    .text(-142, 33, `LEVEL ${levels[choice.id]} → ${levels[choice.id] + 1}`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#6d91a5',
    })
    .setOrigin(0, 0.5);
  const icon = scene.add.circle(134, 0, 22, 0x0da9bd, 0.22).setStrokeStyle(2, 0x73f5ff, 1);
  const plus = scene.add
    .text(134, -1, '+', { fontFamily: 'Arial Black', fontSize: '26px', color: '#caffff' })
    .setOrigin(0.5);
  card.add([body, title, description, level, icon, plus]);
  body.on('pointerover', () => body.setFillStyle(0x0c3246, 1));
  body.on('pointerout', () => body.setFillStyle(0x081a2c, 0.98));
  return card;
}
