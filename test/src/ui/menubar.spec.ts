/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import expect = require('expect.js');

import {
  simulate
} from 'simulate-event';

import {
  toArray
} from '../../../lib/algorithm/iteration';

import {
  JSONObject
} from '../../../lib/algorithm/json';

import {
  Message
} from '../../../lib/core/messaging';

import {
  commands
} from '../../../lib/ui/commands';

import {
  keymap
} from '../../../lib/ui/keymap';

import {
  Menu, MenuItem
} from '../../../lib/ui/menu';

import {
  MenuBar
} from '../../../lib/ui/menubar';

import {
  Widget
} from '../../../lib/ui/widget';


// Set up a default command and its keybinding.
const DEFAULT_CMD = 'defaultCmd';
commands.addCommand(DEFAULT_CMD, {
  execute: (args: JSONObject) => { return args; },
  label: 'LABEL',
  icon: 'foo',
  className: 'bar',
  isToggled: (args: JSONObject) => { return true; },
  mnemonic: 1
});
keymap.addBinding({
  keys: ['A'],
  selector: '*',
  command: DEFAULT_CMD
});


class LogMenuBar extends MenuBar {

  events: string[] = [];

  methods: string[] = [];

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.methods.push('onAfterAttach');
  }

  protected onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.methods.push('onBeforeDetach');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }
}


function createMenuBar(): MenuBar {
  let bar = new MenuBar();
  // Add a few menus to the bar.
  for (let i = 0; i < 3; i++) {
    let menu = new Menu();
    let item = new MenuItem({ command: DEFAULT_CMD });
    menu.addItem(item);
    bar.addMenu(menu);
  }
  bar.activeIndex = 0;
  Widget.attach(bar, document.body);
  return bar;
}


describe('ui/menubar', () => {

  describe('MenuBar(', () => {

    describe('.createNode()', () => {

      it('should create the DOM node for a menu bar', () => {
        let node = MenuBar.createNode();
        expect(node.getElementsByClassName('p-MenuBar-content').length).to.be(1);
        expect(node.tabIndex).to.be(-1);
      });

    });

    describe('#constructor()', () => {

      it('should take no arguments', () => {
        let bar = new MenuBar();
        expect(bar instanceof MenuBar).to.be(true);
      });

      it('should take options for initializing the menu bar', () => {
        let renderer = new MenuBar.ContentRenderer();
        let bar = new MenuBar({ renderer });
        expect(bar instanceof MenuBar).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the menu bar', () => {
        let bar = new MenuBar();
        bar.addMenu(new Menu());
        bar.dispose();
        expect(toArray(bar.menus)).to.eql([]);
        expect(bar.isDisposed).to.be(true);
      });

    });

    describe('#contentNode', () => {

      it('should get the menu content node', () => {
        let bar = new MenuBar();
        let content = bar.contentNode;
        expect(content.classList.contains('p-MenuBar-content')).to.be(true);
      });

    });

    describe('#menus', () => {

      it('should get a read-only sequence of the menus in the menu bar', () => {
        let bar = new MenuBar();
        let menu0 = new Menu();
        let menu1 = new Menu();
        bar.addMenu(menu0);
        bar.addMenu(menu1);
        let menus = bar.menus;
        expect(menus.length).to.be(2);
        expect(menus.at(0)).to.be(menu0);
        expect(menus.at(1)).to.be(menu1);
      });

      it('should be read-only', () => {
        let bar = new MenuBar();
        expect(() => { bar.menus = null; }).to.throwError();
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.activeIndex = 0;
        bar.openActiveMenu();
        expect(bar.childMenu).to.be(menu);
        bar.dispose();
      });

      it('should be `null` if there is no open menu', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.activeIndex = 0;
        expect(bar.childMenu).to.be(null);
        bar.dispose();
      });

      it('should be read-only', () => {
        let bar = new MenuBar();
        expect(() => { bar.childMenu = new Menu(); }).to.throwError();
      });

    });

    describe('#activeMenu', () => {

      it('should get the active menu of the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.activeIndex = 0;
        expect(bar.activeMenu).to.be(menu);
        bar.dispose();
      });

      it('should be `null` if there is no active menu', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        expect(bar.activeMenu).to.be(null);
        bar.dispose();
      });

      it('should set the currently active menu', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.activeMenu = menu;
        expect(bar.activeMenu).to.be(menu);
        bar.dispose();
      });

      it('should set to `null` if the menu is not in the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.activeMenu = menu;
        expect(bar.activeMenu).to.be(null);
        bar.dispose();
      });

    });

    describe('#activeIndex', () => {

      it('should get the index of the currently active menu', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.activeMenu = menu;
        expect(bar.activeIndex).to.be(0);
        bar.dispose();
      });

      it('should be `-1` if no menu is active', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        expect(bar.activeIndex).to.be(-1);
        bar.dispose();
      });

      it('should set the index of the currently active menu', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.activeIndex = 0;
        expect(bar.activeIndex).to.be(0);
        bar.dispose();
      });

      it('should set to `-1` if the index is out of range', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.activeIndex = -2;
        expect(bar.activeIndex).to.be(-1);
        bar.activeIndex = 1;
        expect(bar.activeIndex).to.be(-1);
        bar.dispose();
      });

    });

    describe('#openActiveMenu()', () => {

      it('should open the active menu and activate its first menu item', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        let item = new MenuItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(menu);
        bar.activeMenu = menu;
        bar.openActiveMenu();
        expect(menu.isAttached).to.be(true);
        expect(menu.activeItem.command).to.be(item.command);
        bar.dispose();
      });

      it('should be a no-op if there is no active menu', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        let item = new MenuItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(menu);
        bar.openActiveMenu();
        expect(menu.isAttached).to.be(false);
        bar.dispose();
      });

    });

    describe('#addMenu()', () => {

      it('should add a menu to the end of the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        let item = new MenuItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(new Menu());
        bar.addMenu(menu);
        expect(bar.menus.length).to.be(2);
        expect(bar.menus.at(1)).to.be(menu);
        bar.dispose();
      });

      it('should move an existing menu to the end', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        let item = new MenuItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(menu);
        bar.addMenu(new Menu());
        bar.addMenu(menu);
        expect(bar.menus.length).to.be(2);
        expect(bar.menus.at(1)).to.be(menu);
        bar.dispose();
      });

    });

    describe('#insertMenu()', () => {

      it('should insert a menu into the menu bar at the specified index', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(new Menu());
        bar.insertMenu(0, menu);
        expect(bar.menus.length).to.be(2);
        expect(bar.menus.at(0)).to.be(menu);
        bar.dispose();
      });

      it('should clamp the index to the bounds of the menus', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(new Menu());
        bar.insertMenu(-1, menu);
        expect(bar.menus.length).to.be(2);
        expect(bar.menus.at(0)).to.be(menu);

        menu = new Menu();
        bar.insertMenu(10, menu);
        expect(bar.menus.length).to.be(3);
        expect(bar.menus.at(2)).to.be(menu);

        bar.dispose();
      });

      it('should move an existing menu', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(new Menu());
        bar.insertMenu(0, menu);
        bar.insertMenu(10, menu);
        expect(bar.menus.length).to.be(2);
        expect(bar.menus.at(1)).to.be(menu);
        bar.dispose();
      });

    });

    describe('#removeMenu()', () => {

      it('should remove a menu from the menu bar by value', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(new Menu());
        bar.addMenu(menu);
        bar.removeMenu(menu);
        expect(bar.menus.length).to.be(1);
        expect(bar.menus.at(0)).to.not.be(menu);
        bar.dispose();
      });

      it('should remove a menu from the menu bar by index', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(new Menu());
        bar.addMenu(menu);
        bar.removeMenu(1);
        expect(bar.menus.length).to.be(1);
        expect(bar.menus.at(0)).to.not.be(menu);
        bar.dispose();
      });

      it('should be a no-op if the menu is not contained in the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(new Menu());
        bar.removeMenu(menu);
        expect(bar.menus.length).to.be(1);
        expect(bar.menus.at(0)).to.not.be(menu);
        bar.dispose();
      });

      it('should be a no-op if the index is out of range', () => {
        let bar = new MenuBar();
        let menu = new Menu();
        bar.addMenu(menu);
        bar.removeMenu(-1);
        expect(bar.menus.length).to.be(1);
        bar.removeMenu(1);
        expect(bar.menus.length).to.be(1);
        expect(bar.menus.at(0)).to.be(menu);
        bar.dispose();
      });

    });

    describe('#clearMenus()', () => {

      it('should remove all menus from the menu bar', () => {
        let bar = new MenuBar();
        bar.addMenu(new Menu());
        bar.addMenu(new Menu());
        bar.clearMenus();
        expect(toArray(bar.menus)).to.eql([]);
      });

      it('should be a no-op if there are no menus', () => {
        let bar = new MenuBar();
        bar.clearMenus();
        expect(toArray(bar.menus)).to.eql([]);
      });

    });

    describe('#handleEvent()', () => {

      context('keydown', () => {

        it('should open the active menu on Enter', () => {
          let bar = createMenuBar();
          let menu = bar.activeMenu;
          simulate(bar.node, 'keydown', { keyCode: 13 });
          expect(menu.isAttached).to.be(true);
          bar.dispose();
        });

        it('should open the active menu on Up Arrow', () => {
          let bar = createMenuBar();
          let menu = bar.activeMenu;
          simulate(bar.node, 'keydown', { keyCode: 38 });
          expect(menu.isAttached).to.be(true);
          bar.dispose();
        });

        it('should open the active menu on Down Arrow', () => {
          let bar = createMenuBar();
          let menu = bar.activeMenu;
          simulate(bar.node, 'keydown', { keyCode: 40 });
          expect(menu.isAttached).to.be(true);
          bar.dispose();
        });

        it('should close the active menu on Escape', () => {
          let bar = createMenuBar();
          let menu = bar.activeMenu;
          bar.openActiveMenu();
          simulate(bar.node, 'keydown', { keyCode: 27 });
          expect(menu.isAttached).to.be(false);
          expect(menu.activeIndex).to.be(-1);
          expect(menu.node.contains(document.activeElement)).to.be(false);
          bar.dispose();
        });

        it('should activate the previous menu on Left Arrow', () => {
          let bar = createMenuBar();
          simulate(bar.node, 'keydown', { keyCode: 37 });
          expect(bar.activeIndex).to.be(2);
          simulate(bar.node, 'keydown', { keyCode: 37 });
          expect(bar.activeIndex).to.be(1);
          bar.dispose();
        });

        it('should activate the next menu on Right Arrow', () => {
          let bar = createMenuBar();
          simulate(bar.node, 'keydown', { keyCode: 39 });
          expect(bar.activeIndex).to.be(1);
          simulate(bar.node, 'keydown', { keyCode: 39 });
          expect(bar.activeIndex).to.be(2);
          simulate(bar.node, 'keydown', { keyCode: 39 });
          expect(bar.activeIndex).to.be(0);
          bar.dispose();
        });

      });

    });

  });

});
