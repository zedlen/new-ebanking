import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { UserAgentRepository } from '../repositories/userAgent.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BrowserDetection {
  private readonly logger = new Logger(BrowserDetection.name);
  private readonly DEVICE_MAP = {
    mobile: 'Smartphone',
    tablet: 'Tablet',
    pc: 'Computadora',
    bot: 'BOT',
  };
  constructor(
    private readonly userAgentRepository: UserAgentRepository,
    private readonly configService: ConfigService,
  ) {}

  buildMessage(device, data, referer?) {
    const { device: deviceData = {}, os = {}, browser = {} } = data ?? {};
    const { name: deviceName } = deviceData;
    const osName = os?.name && `SO: ${os?.name},`;
    const browserName = browser?.name && `Navegador: ${browser?.name},`;
    const refererText = referer && `en ${referer},`;
    return `${this.DEVICE_MAP[device]} ${deviceName}, ${osName} ${browserName} ${refererText} el ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`.trim();
  }

  private async detectFromApi(userAgent: string, referer?: string) {
    try {
      this.logger.log('Review agent on DB');
      const agent = await this.userAgentRepository.findOne({ ua: userAgent });
      if (agent) {
        this.logger.log({ agent, msg: 'Agent found on DB' });
        const device =
          Object.keys(agent.info?.type || {}).find(
            (key) => agent.info?.type?.[key] && key != 'touch_capable',
          ) || '';
        return this.buildMessage(device, agent.info, referer);
      }
      this.logger.log('Review agent on API');
      const response = await axios.get(
        `https://api.apilayer.com/user_agent/parse?ua=${userAgent}`,
        {
          headers: { apikey: this.configService.get('API_LAYER_KEY') || '' },
          timeout: 5000,
        },
      );
      const { data } = response;
      this.logger.log({ agent: data, message: 'Agent from API' });
      const device =
        Object.keys(data?.type || {}).find(
          (key) => data?.type?.[key] && key != 'touch_capable',
        ) || '';
      const deviceData = this.buildMessage(device, data, referer);

      if (deviceData) {
        await this.userAgentRepository.save({ ua: userAgent, info: data });
        return deviceData;
      }
    } catch (error) {
      this.logger.warn(
        {
          error,
          msg: `Something went wrong while reviewing user agent on api`,
        },
        error,
      );
    }
  }
  /**
 * 
 * @param userAgent 
 *  This will detect the browser based on this: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#which_part_of_the_user_agent_contains_the_information_you_are_looking_for
 * 
 *  Browser                         Must contain    Must not contain
 *  Firefox	                        Firefox/xyz	    Seamonkey/xyz
    Seamonkey	                    Seamonkey/xyz	
    Chrome	                        Chrome/xyz	    Chromium/xyz or Edg./xyz
    Chromium	                    Chromium/xyz	
    Safari	                        Safari/xyz	    Chrome/xyz or Chromium/xyz
    Opera 15+ (Blink-based engine)	OPR/xyz	
    Opera 12- (Presto-based engine)	Opera/xyz	
 * @returns 
 */
  async detect(userAgent: string, referer?: string) {
    const response = await this.detectFromApi(userAgent, referer);
    if (response) return response;
    const browser = 'Navegador: Chrome';
    if (userAgent.includes('OPR/') || userAgent.includes('Opera/'))
      return 'Navegador: Opera';
    if (userAgent.includes('Seamonkey/') || userAgent.includes('SeaMonkey/'))
      return 'Navegador: Seamonkey';
    if (userAgent.includes('Firefox/')) return 'Navegador: Firefox';
    if (userAgent.includes('Chromium/')) return 'Navegador: Chromium';
    if (userAgent.includes('Edge/') || userAgent.includes('Edg/'))
      return 'Navegador: Edge';
    if (userAgent.includes('Chrome/')) return 'Navegador: Chrome';
    if (userAgent.includes('Safari/')) return 'Navegador: Safari';
    if (userAgent.includes('OkHttp/')) return 'Navegador: Android';
    return browser;
  }
}
