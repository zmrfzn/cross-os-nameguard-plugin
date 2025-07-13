import { Plugin, TFile, Notice, TAbstractFile } from "obsidian";
import { CrossOSNameGuardSettings, DEFAULT_SETTINGS, CrossOSNameGuardSettingTab } from "./settings";
import { DEFAULT_FORBIDDEN_CHARS } from "./constants";

export default class CrossOSNameGuard extends Plugin {
	settings: CrossOSNameGuardSettings;

	async onload() {
		console.info("plugin: CrossOS Name Guard loaded");

		await this.loadSettings();
		this.addSettingTab(new CrossOSNameGuardSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				console.debug("🔄 Active leaf changed");
		
				if (!leaf) return;
		
				const view = leaf.view;
				const file = (view as any).file as TFile;
		
				if (!file) return;
		
				this.checkCurrentFileOrFolder(file);
			})
		);

		this.registerEvent(
			this.app.vault.on("rename", (item) => {
				console.debug(`✏️ Renamed: ${item.name}`);
				this.checkCurrentFileOrFolder(item);
			})
		);

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getForbiddenRegex() {
		let chars = DEFAULT_FORBIDDEN_CHARS;

		if (this.settings.extraForbidden) {
			chars += this.settings.extraForbidden.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
		}

		return new RegExp("[" + chars + "]", "g");
	}

	checkCurrentFileOrFolder(fileOrFolder: TAbstractFile) {
		const forbidden = this.getForbiddenRegex();
		let chars = DEFAULT_FORBIDDEN_CHARS;
	
		if (this.settings.extraForbidden) {
			chars += this.settings.extraForbidden;
		}
	
		const name = fileOrFolder.name;
		console.debug(`👀 Checking: ${name}`);
	
		if (forbidden.test(name)) {
			console.debug(`🚨 Forbidden characters found in: ${name}`);
	
			if (fileOrFolder instanceof TFile) {
				// Delay to update header
				setTimeout(() => {
					const titleEl = document.querySelector(".view-header-title");
					if (!titleEl) return;

					// @ts-ignore
					titleEl.innerText = fileOrFolder.basename;
					// @ts-ignore
					titleEl.innerText = `⚠️ ${fileOrFolder.basename}`;
				}, 100);
			}
	
			new Notice(
				`⚠️ "${name}" contains characters not supported on all OSes and may result in broken sync.\nForbidden: ${chars}\nConsider fixing before proceeding.`,
				10000
			);
		} else {
			console.debug(`✅ No forbidden characters in: ${name}`);
		}
	}

	onunload() {
		console.debug("🛑 CrossOS Name Guard plugin unloaded");
	}
}
