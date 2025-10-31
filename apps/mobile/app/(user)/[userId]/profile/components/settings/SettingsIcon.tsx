import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Rect, Circle, Polyline } from 'react-native-svg';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export const SettingsIcon = ({ name, size = 24, color = '#000' }: IconProps) => {
  const renderIcon = () => {
    switch (name) {
      case 'security':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M15.25,3c-.414,0-.75,.336-.75,.75V14.25c0,.414,.336,.75,.75,.75s.75-.336,.75-.75V3.75c0-.414-.336-.75-.75-.75Z"
                fill={color}
              />
              <Path
                d="M6.01,7.483l-1.01,.328v-1.062c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.062l-1.01-.328c-.394-.126-.816,.087-.944,.481s.087,.817,.481,.945l1.009,.328-.624,.858c-.244,.335-.17,.804,.166,1.048,.133,.097,.287,.143,.439,.143,.232,0,.461-.107,.607-.309l.624-.859,.624,.859c.146,.202,.375,.309,.607,.309,.152,0,.307-.046,.439-.143,.336-.244,.41-.712,.166-1.048l-.624-.858,1.009-.328c.395-.128,.609-.551,.481-.945-.127-.394-.545-.61-.944-.481Z"
                fill={color}
              />
              <Path
                d="M12.26,7.483l-1.01,.328v-1.062c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.062l-1.01-.328c-.392-.126-.816,.087-.944,.481s.087,.817,.481,.945l1.009,.328-.624,.858c-.244,.335-.17,.804,.166,1.048,.133,.097,.287,.143,.439,.143,.232,0,.461-.107,.607-.309l.624-.859,.624,.859c.146,.202,.375,.309,.607,.309,.152,0,.307-.046,.439-.143,.336-.244,.41-.712,.166-1.048l-.624-.858,1.009-.328c.395-.128,.609-.551,.481-.945-.127-.394-.547-.61-.944-.481Z"
                fill={color}
              />
            </Svg>
          </View>
        );
      case 'privacy':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.eye, { borderColor: color }]} />
            <View style={[styles.slash, { backgroundColor: color }]} />
          </View>
        );
      case 'notification':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M14.75 8.7435V13.75C14.75 14.855 13.855 15.75 12.75 15.75H4.25C3.145 15.75 2.25 14.855 2.25 13.75V5.25C2.25 4.145 3.145 3.25 4.25 3.25H9.2565"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M14.5 5.75C15.743 5.75 16.75 4.743 16.75 3.5C16.75 2.257 15.743 1.25 14.5 1.25C13.257 1.25 12.25 2.257 12.25 3.5C12.25 4.743 13.257 5.75 14.5 5.75Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      case 'theme':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M9,12V6c-1.657,0-3,1.343-3,3s1.343,3,3,3Z"
                fill={color}
              />
              <Path
                d="M9,6c1.657,0,3,1.343,3,3s-1.343,3-3,3v4.25c4.004,0,7.25-3.246,7.25-7.25S13.004,1.75,9,1.75V6Z"
                fill={color}
              />
              <Path
                d="M9,1c4.411,0,8,3.589,8,8s-3.589,8-8,8S1,13.411,1,9,4.589,1,9,1Zm0,14.5c3.584,0,6.5-2.916,6.5-6.5s-2.916-6.5-6.5-6.5S2.5,5.416,2.5,9s2.916,6.5,6.5,6.5Z"
                fill={color}
              />
            </Svg>
          </View>
        );
      case 'data':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.database, { borderColor: color }]} />
            <View style={[styles.arrow, { borderColor: color }]} />
          </View>
        );
      case 'language':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M2.25 4.25H10.25"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M6.25 2.25V4.25"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M4.25 4.25C4.3353 6.7587 5.9446 8.94141 8.2746 9.78371"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M8.25 4.25C7.85 9.875 2.25 10.25 2.25 10.25"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M9.25 15.75L12.25 7.75H12.75L15.75 15.75"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M10.188 13.25H14.813"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      case 'delete':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.trash, { borderColor: color }]} />
            <View style={[styles.line, { backgroundColor: color }]} />
          </View>
        );
      case 'logout':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M11.75,5.75V3.25c0-.552-.448-1-1-1H4.25c-.552,0-1,.448-1,1V14.75c0,.552,.448,1,1,1h6.5c.552,0,1-.448,1-1v-2.5"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Polyline
                points="14.5 6.25 17.25 9 14.5 11.75"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Line
                x1="17.25"
                y1="9"
                x2="11.25"
                y2="9"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="M3.457,2.648l3.321,2.059c.294,.182,.473,.504,.473,.85v6.887c0,.346-.179,.667-.473,.85l-3.322,2.06"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
        );
      case 'account':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M8 8.25C9.7949 8.25 11.25 6.794 11.25 5C11.25 3.206 9.7949 1.75 8 1.75C6.2051 1.75 4.75 3.206 4.75 5C4.75 6.794 6.2051 8.25 8 8.25Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M1.953 14.5C3.1574 12.6813 5.15919 11.4395 7.45889 11.2699"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M14.925 15.75H8.75L10.618 11.55C10.698 11.3699 10.877 11.25 11.075 11.25H16.481C16.843 11.25 17.085 11.62 16.938 11.95L15.382 15.45C15.302 15.6301 15.123 15.75 14.925 15.75Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M8.75 15.75H5.75"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      case 'location':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Circle
                cx="9"
                cy="5"
                r="3.25"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Line
                x1="9"
                y1="13.25"
                x2="9"
                y2="8.25"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="M12 12.429c2.507 0.315 4.25 1.012 4.25 1.821 0 1.105-3.246 2-7.25 2s-7.25-0.895-7.25-2c0-0.809 1.743-1.507 4.25-1.821"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
        );
      case 'blocked':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M4.40401 13.596C3.22801 12.42 2.5 10.795 2.5 9C2.5 5.41 5.41 2.5 9 2.5C10.795 2.5 12.42 3.228 13.596 4.404"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M7.409 10.591C7.002 10.184 6.75 9.621 6.75 9C6.75 7.757 7.757 6.75 9 6.75C9.621 6.75 10.184 7.002 10.591 7.409"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M9 1V2.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M17 9H15.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M9 17V15.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M1 9H2.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M2 16L16 2"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M7.04462 15.1975C7.66202 15.3921 8.31792 15.5 9.00002 15.5C12.59 15.5 15.5 12.5898 15.5 9C15.5 8.3186 15.3927 7.6621 15.1979 7.0444"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      case 'profileVisibility':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Circle
                cx="9"
                cy="4.5"
                r="2.75"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="M13.762,15.516c.86-.271,1.312-1.221,.947-2.045-.97-2.191-3.159-3.721-5.709-3.721s-4.739,1.53-5.709,3.721c-.365,.825,.087,1.774,.947,2.045,1.225,.386,2.846,.734,4.762,.734s3.537-.348,4.762-.734Z"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
        );
      case 'activityStatus':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M9 1C8.586 1 8.25 1.336 8.25 1.75V4.25C8.25 4.664 8.586 5 9 5C9.414 5 9.75 4.664 9.75 4.25V2.543C12.982 2.916 15.5 5.669 15.5 9C15.5 12.584 12.584 15.5 9 15.5C5.416 15.5 2.5 12.584 2.5 9C2.5 7.264 3.176 5.631 4.404 4.404C4.697 4.111 4.697 3.636 4.404 3.343C4.111 3.05 3.636 3.05 3.343 3.343C1.832 4.854 1 6.863 1 9C1 13.411 4.589 17 9 17C13.411 17 17 13.411 17 9C17 4.589 13.411 1 9 1Z"
                fill={color}
              />
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.46967 5.46967C5.76256 5.17678 6.23744 5.17678 6.53033 5.46967L9.53033 8.46967C9.82322 8.76256 9.82322 9.23744 9.53033 9.53033C9.23744 9.82322 8.76256 9.82322 8.46967 9.53033L5.46967 6.53033C5.17678 6.23744 5.17678 5.76256 5.46967 5.46967Z"
                fill={color}
              />
            </Svg>
          </View>
        );
      case 'blockedAccounts':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M4.40401 13.596C3.22801 12.42 2.5 10.795 2.5 9C2.5 5.41 5.41 2.5 9 2.5C10.795 2.5 12.42 3.228 13.596 4.404"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M7.409 10.591C7.002 10.184 6.75 9.621 6.75 9C6.75 7.757 7.757 6.75 9 6.75C9.621 6.75 10.184 7.002 10.591 7.409"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M9 1V2.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M17 9H15.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M9 17V15.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M1 9H2.5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M2 16L16 2"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M7.04462 15.1975C7.66202 15.3921 8.31792 15.5 9.00002 15.5C12.59 15.5 15.5 12.5898 15.5 9C15.5 8.3186 15.3927 7.6621 15.1979 7.0444"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        );
      case 'loginAlerts':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M9 1L2 4V9C2 13.5 9 17 9 17C9 17 16 13.5 16 9V4L9 1Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M9 6V10"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx="9"
                cy="12"
                r="1"
                fill={color}
              />
            </Svg>
          </View>
        );
      case 'activeSessions':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M9 16.25C13.004 16.25 16.25 13.004 16.25 9C16.25 4.996 13.004 1.75 9 1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 13.004 4.996 16.25 9 16.25Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M9 12.75V9.25C9 8.9739 8.7761 8.75 8.5 8.75H7.75"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.199 10 5.75C10 6.301 9.552 6.75 9 6.75Z"
                fill={color}
              />
            </Svg>
          </View>
        );
      case 'appLock':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M14.013,14.963c-.08,0-.161-.013-.241-.04-.393-.133-.603-.559-.469-.951,.629-1.851,.947-3.86,.947-5.972,0-2.895-2.355-5.25-5.25-5.25-1.259,0-2.478,.455-3.432,1.28-.312,.271-.787,.237-1.058-.077s-.236-.787,.077-1.058c1.226-1.061,2.793-1.645,4.412-1.645,3.722,0,6.75,3.028,6.75,6.75,0,2.276-.346,4.447-1.027,6.454-.105,.312-.397,.509-.71,.509Z"
                fill={color}
              />
              <Path
                d="M1.906,12.453c-.134,0-.27-.036-.392-.111-.354-.217-.463-.679-.246-1.032,.935-1.519,.981-3.023,.981-3.31,0-1.004,.216-1.971,.643-2.872,.177-.374,.621-.536,.998-.358,.375,.177,.535,.624,.357,.999-.33,.7-.498,1.451-.498,2.231,0,.357-.058,2.232-1.204,4.096-.142,.23-.388,.357-.64,.357Z"
                fill={color}
              />
              <Path
                d="M9.918,16.698c-.129,0-.26-.033-.38-.104-.356-.21-.476-.67-.266-1.027,.982-1.669,1.606-3.526,1.854-5.518,.051-.412,.415-.703,.837-.652,.411,.051,.702,.425,.651,.836-.272,2.197-.962,4.247-2.049,6.094-.14,.237-.391,.37-.647,.37Z"
                fill={color}
              />
              <Path
                d="M3.872,14.89c-.169,0-.338-.056-.479-.172-.318-.264-.363-.737-.1-1.056,1.298-1.569,1.956-3.474,1.956-5.662,0-2.068,1.683-3.75,3.75-3.75,1.878,0,3.477,1.402,3.719,3.262,.053,.411-.236,.787-.647,.84-.417,.052-.787-.237-.841-.647-.145-1.115-1.104-1.955-2.23-1.955-1.24,0-2.25,1.009-2.25,2.25,0,2.546-.773,4.773-2.3,6.618-.148,.179-.362,.272-.578,.272Z"
                fill={color}
              />
              <Path
                d="M6.55,16.368c-.158,0-.317-.05-.453-.153-.329-.251-.394-.721-.143-1.051,1.523-2.004,2.296-4.414,2.296-7.164,0-.414,.336-.75,.75-.75s.75,.336,.75,.75c0,3.085-.876,5.801-2.603,8.072-.147,.194-.371,.296-.598,.296Z"
                fill={color}
              />
            </Svg>
          </View>
        );
      case 'securityCheckup':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M9 1L2 4V9C2 13.5 9 17 9 17C9 17 16 13.5 16 9V4L9 1Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M6.5 9L8.5 11L11.5 8"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'dataSharing':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M2.25,7.75v-3c0-1.105,.895-2,2-2h1.951c.607,0,1.18,.275,1.56,.748l.603,.752h5.386c1.105,0,2,.895,2,2v1.5"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M2.702,7.75H15.298c.986,0,1.703,.934,1.449,1.886l-1.101,4.129c-.233,.876-1.026,1.485-1.932,1.485H4.287c-.906,0-1.699-.609-1.932-1.485l-1.101-4.129c-.254-.952,.464-1.886,1.449-1.886Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'privacyInsights':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M5.75,8.25v-3.25c0-1.795,1.455-3.25,3.25-3.25h0c1.795,0,3.25,1.455,3.25,3.25v3.25"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                x1="9"
                y1="11.75"
                x2="9"
                y2="12.75"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Rect
                x="3.25"
                y="8.25"
                width="11.5"
                height="8"
                rx="2"
                ry="2"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'arrow':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M13.28,8.47L7.03,2.22c-.293-.293-.768-.293-1.061,0s-.293,.768,0,1.061l5.72,5.72-5.72,5.72c-.293,.293-.293,.768,0,1.061,.146,.146,.338,.22,.53,.22s.384-.073,.53-.22l6.25-6.25c.293-.293,.293-.768,0-1.061Z"
                fill={color}
              />
            </Svg>
          </View>
        );
      case 'password':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M5.75,8.25v-3.25c0-1.795,1.455-3.25,3.25-3.25h0c1.795,0,3.25,1.455,3.25,3.25v3.25"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                x1="9"
                y1="11.75"
                x2="9"
                y2="12.75"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Rect
                x="3.25"
                y="8.25"
                width="11.5"
                height="8"
                rx="2"
                ry="2"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'emailPhone':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M2.25 4.25H15.75C16.3023 4.25 16.75 4.69772 16.75 5.25V12.75C16.75 13.3023 16.3023 13.75 15.75 13.75H2.25C1.69772 13.75 1.25 13.3023 1.25 12.75V5.25C1.25 4.69772 1.69772 4.25 2.25 4.25Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M2.25 5.25L9 9.75L15.75 5.25"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12.25 14.25C12.9398 14.25 13.5 13.6898 13.5 13C13.5 12.3102 12.9398 11.75 12.25 11.75C11.5602 11.75 11 12.3102 11 13C11 13.6898 11.5602 14.25 12.25 14.25Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M13.75 16.25C14.5784 16.25 15.25 15.5784 15.25 14.75V13.25C15.25 12.4216 14.5784 11.75 13.75 11.75"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'download':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M9 12.75V3.25"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points="6.5 9.75 9 12.25 11.5 9.75"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M3.25 14.75H14.75"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      case 'linkedAccounts':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Svg
              width={size}
              height={size}
              viewBox="0 0 18 18"
              style={styles.svgIcon}
            >
              <Path
                d="M6.25 9C6.25 10.5188 7.48122 11.75 9 11.75C10.5188 11.75 11.75 10.5188 11.75 9C11.75 7.48122 10.5188 6.25 9 6.25C7.48122 6.25 6.25 7.48122 6.25 9Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M2.5 13.5C3.39783 12.5805 4.51751 11.9783 5.75 11.9783C6.98249 11.9783 8.10217 12.5805 9 13.5"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12.25 6C13.3546 6 14.25 5.10457 14.25 4C14.25 2.89543 13.3546 2 12.25 2C11.1454 2 10.25 2.89543 10.25 4C10.25 5.10457 11.1454 6 12.25 6Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M15.25 14C16.3546 14 17.25 13.1046 17.25 12C17.25 10.8954 16.3546 10 15.25 10C14.1454 10 13.25 10.8954 13.25 12C13.25 13.1046 14.1454 14 15.25 14Z"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.default, { borderColor: color }]} />
          </View>
        );
    }
  };

  return renderIcon();
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shield: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  checkmark: {
    position: 'absolute',
    width: 6,
    height: 3,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderBottomLeftRadius: 1,
    transform: [{ rotate: '-45deg' }],
    top: 6,
  },
  eye: {
    width: 16,
    height: 10,
    borderWidth: 2,
    borderRadius: 8,
  },
  slash: {
    position: 'absolute',
    width: 12,
    height: 2,
    transform: [{ rotate: '45deg' }],
  },
  bell: {
    width: 14,
    height: 12,
    borderWidth: 2,
    borderRadius: 7,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 2,
    right: 2,
  },
  sun: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
  moon: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 2,
    right: 2,
  },
  database: {
    width: 16,
    height: 12,
    borderWidth: 2,
    borderRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  arrow: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    transform: [{ rotate: '45deg' }],
    top: 2,
    right: -2,
  },
  trash: {
    width: 12,
    height: 14,
    borderWidth: 2,
    borderRadius: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  line: {
    position: 'absolute',
    width: 8,
    height: 2,
    top: 4,
    left: 2,
  },
  accountCircle: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
  accountHead: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 2,
    borderRadius: 4,
    top: 2,
    left: 4,
  },
  pin: {
    width: 10,
    height: 14,
    borderWidth: 2,
    borderRadius: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pinDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 0,
    left: 2,
  },
  default: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
  svgIcon: {
    width: '100%',
    height: '100%',
  },
});
