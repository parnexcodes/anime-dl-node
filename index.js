import readline from "readline";
import chalk from 'chalk';
import { ANIME } from "@consumet/extensions";
import child_process from 'child_process'

const cp = child_process

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

// Usage inside aync function do not need closure demo only*
(async () => {
  try {
    const gogoanime = new ANIME.Gogoanime();
    console.log(chalk.whiteBright("Welcome to animedl\nby @parnexcodes"));
    const search_anime_prompt = await prompt(chalk.cyan("Search for anime : "));
    // Search for an anime. In this case, "One Piece"
    const search_result = await gogoanime.search(search_anime_prompt)
    const console_result = search_result.results.map((item, index) => {
        console.log(chalk.green(`[${index}] `) + chalk.cyanBright(item.title)+ " : " + chalk.red(item.url))
    })
    const select_anime_prompt = await prompt(chalk.cyan("Select the search result") + chalk.blue("\n[1/2/3/4 etc...] : "));
    const quality_prompt = await prompt(chalk.cyan("Select the quality: ") + chalk.blue("\n[0 = 360p]\n[1 = 480p]\n[2 = 720p]\n[3 = 1080p]\n: "));
    const selected_anime = search_result.results[Number(select_anime_prompt)]
    const anime_name = selected_anime.title
    cp.spawnSync(`mkdir "${anime_name}"`, { encoding : 'utf8', shell: true, stdio: 'inherit' });
    const download_episodes = async (selected_anime, anime_name) => {
        const total_ep = await gogoanime.fetchAnimeInfo(selected_anime.id)
        for (const item of total_ep.episodes) {
          const ep_id = item.id
          const hls = await gogoanime.fetchEpisodeSources(ep_id)
          const download_ep = cp.spawnSync(`N_m3u8DL-CLI_v3.0.2.exe "${hls.sources[Number(quality_prompt)].url}" --workDir "${anime_name}" --enableDelAfterDone --saveName "EP - ${item.number}"`, { encoding : 'utf8', shell: true, stdio: 'inherit' });
          console.log(download_ep)
        }
    }
    await download_episodes(selected_anime, anime_name)
    
    rl.close();
  } catch (e) {
    console.error("Unable to prompt", e);
  }
})();

// When done reading prompt, exit program
rl.on("close", () => process.exit(0));
